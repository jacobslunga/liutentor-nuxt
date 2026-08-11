<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
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

const {
  messages,
  isLoading,
  selectionContext,
  chatHeaderTitle,
  giveDirectAnswer,
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
  <div class="h-full w-full flex bg-background overflow-hidden relative">
    <div class="flex-1 min-w-0 relative overflow-hidden">
      <!-- Solid, so the transcript scrolls cleanly under it. It still overlays
           the scroll container rather than sitting in flow — the padding below
           is what keeps the newest message clear of it. -->
      <div class="absolute inset-x-0 top-0 z-20">
        <ChatHeader :has-solution="hasSolution" :title="chatHeaderTitle" :history-open="isHistoryOpen"
          @close="emit('close')" @open-history="toggleHistory" @new-chat="startNewChat" />
      </div>

      <div class="h-full w-full">
        <ChatMessages ref="transcriptRef" :messages="messages" :is-loading="isLoading" content-class="pt-14"
          @reply-to-selection="handleReplyToSelection" @update:show-scroll-button="showScrollButton = $event" />

        <div class="absolute bottom-0 left-0 right-0 pt-14 pb-4 pointer-events-none z-10">
          <div class="fade-to-background pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10" />
          <ChatInput ref="chatInputRef" :initial-text="chatStore.draftInput" :is-loading="isLoading"
            :give-direct-answer="giveDirectAnswer" :selected-model-id="selectedModelId"
            :show-scroll-button="showScrollButton" :course-code="courseCode" :has-solution="hasSolution"
            :selection-context="selectionContext" class="pointer-events-auto" @send="handleSend" @cancel="handleCancel"
            @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
            @update:give-direct-answer="giveDirectAnswer = $event" @update:selected-model-id="selectedModelId = $event"
            @clear-selection-context="selectionContext = ''" />
        </div>
      </div>
    </div>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </div>
</template>
