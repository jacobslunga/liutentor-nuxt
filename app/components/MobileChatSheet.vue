<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
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

const chatStore = useChatStore();
const { isOpen, isHistoryOpen } = storeToRefs(chatStore);

const chatInputRef = ref<ChatInputApi | null>(null);
const transcriptRef = ref<ChatTranscriptApi | null>(null);
const showScrollButton = ref(false);

const MOBILE_MODEL_ID = "gemini-3.1-flash-lite";
const MOBILE_DIRECT_ANSWER = true;

const {
  messages,
  isLoading,
  selectionContext,
  chatHeaderTitle,
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
  fixedModelId: MOBILE_MODEL_ID,
  fixedDirectAnswer: MOBILE_DIRECT_ANSWER,
});

function openChat() {
  chatStore.open();
}

function closeChat() {
  chatStore.draftInput = chatInputRef.value?.getText() ?? "";
  chatStore.close();
  isHistoryOpen.value = false;
}

watch(isOpen, (open) => {
  if (!open) {
    isHistoryOpen.value = false;
    return;
  }

  nextTick(() => {
    transcriptRef.value?.restoreScroll();
  });
});

watch(transcriptRef, (transcript) => {
  if (transcript) nextTick(() => transcript.restoreScroll());
});
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-chat-launcher">
      <button
        v-if="!isOpen"
        type="button"
        class="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-80 flex h-14 items-center gap-2.5 rounded-full border border-border bg-background px-3 shadow-lg"
        aria-label="Öppna chatten"
        @click="openChat"
      >
        <ChatMascot class="size-7 shrink-0" />
        <span
          class="flex h-10 min-w-0 flex-1 items-center rounded-full bg-secondary/40 px-4 text-left text-base text-muted-foreground/80"
        >
          Fråga vad som helst
        </span>
      </button>
    </Transition>

    <Transition name="mobile-chat-dialog">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-80 flex h-dvh w-screen flex-col overflow-hidden bg-background"
        role="dialog"
        aria-modal="true"
        aria-label="Chatt"
      >
        <header
          class="shrink-0 border-b border-border bg-background pt-[env(safe-area-inset-top,0px)]"
        >
          <div class="flex h-14 items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="icon-sm"
              class="shrink-0"
              aria-label="Stäng chatten"
              @click="closeChat"
            >
              <LucideX class="size-4" />
            </Button>

            <p
              class="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
            >
              {{ chatHeaderTitle }}
            </p>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Ny chatt"
              @click="startNewChat"
            >
              <LucideMessageSquareShare class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Historik"
              @click="toggleHistory"
            >
              <LucidePanelRight class="size-4" />
            </Button>
          </div>
        </header>

        <div class="min-h-0 flex-1">
          <LazyChatMessages
            ref="transcriptRef"
            :messages="messages"
            :is-loading="isLoading"
            content-class="pt-4"
            :enable-selection-popover="false"
            @reply-to-selection="handleReplyToSelection"
            @update:show-scroll-button="showScrollButton = $event"
          />
        </div>

        <div
          class="shrink-0 bg-background pt-2 pb-[env(safe-area-inset-bottom,0px)]"
        >
          <ChatInput
            ref="chatInputRef"
            :initial-text="chatStore.draftInput"
            :is-loading="isLoading"
            :give-direct-answer="MOBILE_DIRECT_ANSWER"
            :selected-model-id="MOBILE_MODEL_ID"
            :show-scroll-button="showScrollButton"
            :course-code="courseCode"
            :has-solution="hasSolution"
            :selection-context="selectionContext"
            :autofocus="false"
            :auto-resize="false"
            :reactive-input="false"
            :submit-on-enter="false"
            compact
            @send="handleSend"
            @cancel="handleCancel"
            @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
            @clear-selection-context="selectionContext = ''"
          />
        </div>
      </div>
    </Transition>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </Teleport>
</template>

<style scoped>
.mobile-chat-dialog-enter-active,
.mobile-chat-dialog-leave-active,
.mobile-chat-launcher-enter-active,
.mobile-chat-launcher-leave-active {
  transition: opacity 180ms ease;
}

.mobile-chat-dialog-enter-from,
.mobile-chat-dialog-leave-to,
.mobile-chat-launcher-enter-from,
.mobile-chat-launcher-leave-to {
  opacity: 0;
}
</style>
