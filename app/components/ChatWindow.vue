<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useResizeObserver } from "@vueuse/core";
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
const inputRegionRef = ref<HTMLDivElement | null>(null);
const showScrollButton = ref(false);
const contentBottom = ref(Number.NEGATIVE_INFINITY);
const showDisclaimer = ref(true);

function updateDisclaimerVisibility() {
  const shellTop = chatInputRef.value?.getShellTop();
  if (shellTop === null || shellTop === undefined) return;
  showDisclaimer.value = contentBottom.value <= shellTop - 32;
}

function handleContentBottom(value: number) {
  contentBottom.value = value;
  nextTick(updateDisclaimerVisibility);
}

useResizeObserver(inputRegionRef, () => nextTick(updateDisclaimerVisibility));
const attachmentSurfaceEnabled = computed(() => isOpen.value);
const { dropZoneRef, isOverDropZone } = useChatAttachmentSurface(
  chatInputRef,
  attachmentSurfaceEnabled,
);

const {
  messages,
  isLoading,
  selectionContext,
  chatHeaderTitle,
  selectedModelId,
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
  <div
    ref="dropZoneRef"
    class="h-full w-full flex bg-background overflow-hidden relative"
  >
    <Transition name="drop-overlay">
      <ChatDropOverlay v-if="isOverDropZone && !isLoading" />
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div class="pointer-events-none absolute inset-x-0 top-0 z-20">
        <ChatHeader
          :has-solution="hasSolution"
          :title="chatHeaderTitle"
          :history-open="isHistoryOpen"
          @close="emit('close')"
          @open-history="toggleHistory"
          @new-chat="startNewChat"
        />
      </div>

      <div class="relative min-h-0 w-full flex-1">
        <ChatMessages
          ref="transcriptRef"
          :messages="messages"
          :is-loading="isLoading"
          content-class="pt-12"
          assistant-class="font-serif"
          @reply-to-selection="handleReplyToSelection"
          @update:show-scroll-button="showScrollButton = $event"
          @update:content-bottom="handleContentBottom"
        />

        <div
          ref="inputRegionRef"
          class="absolute bottom-0 left-0 right-0 pt-8 pb-4 pointer-events-none z-10"
        >
          <div
            class="fade-to-background pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10"
          />
          <ChatInput
            ref="chatInputRef"
            :initial-text="chatStore.draftInput"
            :initial-attachments="chatStore.draftAttachments"
            :is-loading="isLoading"
            :selected-model-id="selectedModelId"
            :show-scroll-button="showScrollButton"
            :course-code="courseCode"
            :has-solution="hasSolution"
            :selection-context="selectionContext"
            :show-disclaimer="showDisclaimer"
            class="pointer-events-auto"
            @send="handleSend"
            @cancel="handleCancel"
            @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
            @update:selected-model-id="selectedModelId = $event"
            @clear-selection-context="selectionContext = ''"
          />
        </div>
      </div>
    </div>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </div>
</template>
