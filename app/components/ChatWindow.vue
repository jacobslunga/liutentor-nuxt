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
      <div class="relative z-20 shrink-0">
        <ChatHeader :has-solution="hasSolution" :title="chatHeaderTitle" :history-open="isHistoryOpen"
          @close="emit('close')" @open-history="toggleHistory" @new-chat="startNewChat" />
      </div>

      <div class="relative min-h-0 w-full flex-1">
        <ChatMessages ref="transcriptRef" :messages="messages" :is-loading="isLoading" assistant-class="font-sans"
          hide-empty-state content-class="pb-24" @reply-to-selection="handleReplyToSelection"
          @update:show-scroll-button="showScrollButton = $event" />

        <!-- Samma skrivfält i båda lägena — bara omslaget byter plats, så
             instansen lever vidare och fokus och utkast följer med när det
             första meddelandet skickas. -->
        <div class="pointer-events-none absolute z-10" :class="hasMessages
          ? 'inset-x-0 bottom-0 pb-4'
          : 'inset-0 flex flex-col items-center justify-center gap-7 px-4 pb-10'
          ">
          <!-- Omslaget börjar exakt vid skrivfältets överkant, så tonen slutar
               där och texten glider in under fältet — det är fältets egen opaka
               yta som döljer den. Plattan behövs bara för att foten under
               fältet, med ansvarsfriskrivning och tankenivå, ska stå på solid
               bakgrund istället för på rullande text. -->
          <template v-if="hasMessages">
            <div class="fade-to-background pointer-events-none absolute inset-x-0 bottom-full h-12 -z-10" />
            <div class="pointer-events-none absolute inset-0 bg-background -z-10" />
          </template>

          <div v-else class="flex flex-col items-center gap-4">
            <ChatMascot class="size-14 shrink-0" />
            <h2 class="text-2xl font-semibold text-foreground">
              Vad kan jag hjälpa till med?
            </h2>
          </div>

          <ChatInput ref="chatInputRef" :initial-text="chatStore.draftInput"
            :initial-attachments="chatStore.draftAttachments" :is-loading="isLoading"
            :selected-model-id="selectedModelId" :web-search="webSearch" :show-scroll-button="showScrollButton"
            :course-code="courseCode" :has-solution="hasSolution" :selection-context="selectionContext"
            :hero="!hasMessages" show-disclaimer class="pointer-events-auto" @send="handleSend" @cancel="handleCancel"
            @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
            @update:selected-model-id="selectedModelId = $event" @update:web-search="webSearch = $event"
            @clear-selection-context="selectionContext = ''" />
        </div>
      </div>
    </div>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </div>
</template>
