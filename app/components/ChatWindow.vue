<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useChatStore } from "@/stores/chat";
import {
  useChatPanel,
  type ChatInputApi,
  type ChatTranscriptApi,
} from "@/composables/useChatPanel";

const props = defineProps<{
  examId: string;
  examUrl: string;
  courseCode: string;
  solutionUrl?: string | null;
  hasSolution: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const chatStore = useChatStore();
const { isOpen, isHistoryOpen } = storeToRefs(chatStore);

const chatInputRef = ref<ChatInputApi | null>(null);
const transcriptRef = ref<ChatTranscriptApi | null>(null);
const showScrollButton = ref(false);

const attachmentSurfaceEnabled = computed(() => isOpen.value);
const { isOverDropZone } = useChatAttachmentSurface(
  chatInputRef,
  attachmentSurfaceEnabled,
);

const {
  messages,
  isLoading,
  selectionContext,
  chatHeaderTitle,
  selectedModelId,
  webSearch,
  handleSend,
  handleCancel,
  handleReplyToSelection,
  toggleHistory,
  startNewChat,
} = useChatPanel({
  examId: props.examId,
  examUrl: props.examUrl,
  courseCode: props.courseCode,
  solutionUrl: props.solutionUrl,
  input: chatInputRef,
  transcript: transcriptRef,
});

const hasMessages = computed(() => messages.value.length > 0);

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => chatInputRef.value?.focus());
  } else {
    isHistoryOpen.value = false;
  }
});

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return;

  const isHistoryShortcut =
    (e.metaKey || e.ctrlKey) && (e.key === "." || e.code === "Period");

  if (isHistoryShortcut) {
    e.preventDefault();
    toggleHistory();
    return;
  }

  if (e.key === "Escape") {
    if (isHistoryOpen.value) {
      e.preventDefault();
      isHistoryOpen.value = false;
      return;
    }

    if (chatStore.isOpen) {
      chatStore.close();
    }
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown, true);
});

defineExpose({ focusInput: () => chatInputRef.value?.focus() });
</script>

<template>
  <div ref="dropZoneRef" class="h-full w-full flex bg-background overflow-hidden relative">
    <Transition name="drop-overlay">
      <ChatDropOverlay v-if="isOverDropZone && !isLoading" />
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div class="relative min-h-0 w-full flex-1">
        <ChatMessages ref="transcriptRef" :messages="messages" :is-loading="isLoading" assistant-class="font-sans"
          hide-empty-state content-class="pt-16 pb-6" @reply-to-selection="handleReplyToSelection"
          @update:show-scroll-button="showScrollButton = $event" />

        <!-- Headern ligger ovanpå transkriptet i stället för över det, så att
             meddelandena rullar in under den. Listans pt-16 håller det första
             meddelandet fritt från toningen när man är högst upp. -->
        <div class="pointer-events-none absolute inset-x-0 top-0 z-20">
          <ChatHeader :has-solution="hasSolution" :title="chatHeaderTitle" :history-open="isHistoryOpen"
            @close="emit('close')" @open-history="toggleHistory" @new-chat="startNewChat" />
        </div>

        <div class="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end">
          <div v-if="!hasMessages"
            class="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <ChatMascot class="size-14 shrink-0" />
            <div class="space-y-2">
              <h2 class="text-2xl font-semibold text-foreground">
                Vad kan jag hjälpa till med?
              </h2>
              <p class="mx-auto max-w-70 text-sm leading-relaxed text-muted-foreground sm:max-w-md">
                Ställ frågor om tentan eller få hjälp att förstå lösningarna.
              </p>
            </div>
            <NuxtLink to="/ai-policy" target="_blank"
              class="pointer-events-auto mt-2 border-b border-transparent pb-0.5 text-2xs text-muted-foreground/60 transition-colors duration-200 hover:border-foreground/30 hover:text-foreground">
              Läs vår AI-policy
            </NuxtLink>
          </div>

          <div class="relative pb-2">
            <div
              class="pointer-events-none absolute inset-x-0 h-36 bottom-0 -z-10 bg-linear-to-t from-background via-background to-transparent" />

            <ChatInput ref="chatInputRef" :initial-text="chatStore.draftInput"
              :initial-attachments="chatStore.draftAttachments" :is-loading="isLoading"
              :selected-model-id="selectedModelId" :web-search="webSearch" :show-scroll-button="showScrollButton"
              :course-code="courseCode" :has-solution="hasSolution" :selection-context="selectionContext"
              show-disclaimer class="pointer-events-auto" @send="handleSend" @cancel="handleCancel"
              @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
              @update:selected-model-id="selectedModelId = $event" @update:web-search="webSearch = $event"
              @clear-selection-context="selectionContext = ''" />
          </div>
        </div>
      </div>
    </div>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </div>
</template>
