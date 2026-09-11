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

const chatStore = useChatStore();
const { isOpen, isHistoryOpen } = storeToRefs(chatStore);

const chatInputRef = ref<ChatInputApi | null>(null);
const transcriptRef = ref<ChatTranscriptApi | null>(null);
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
  handleSend,
  handleCancel,
  handleReplyToSelection,
  toggleHistory,
  startNewChat,
  selectedModelId,
  webSearch,
} = useChatPanel({
  examId: props.examId,
  examUrl: props.examUrl,
  courseCode: props.courseCode,
  solutionUrl: props.solutionUrl,
  input: chatInputRef,
  transcript: transcriptRef,
});

function openChat() {
  chatStore.open();
}

function closeChat() {
  chatStore.draftInput = chatInputRef.value?.getText() ?? "";
  chatStore.draftAttachments = chatInputRef.value?.getAttachments() ?? [];
  chatStore.close();
  isHistoryOpen.value = false;
}

const hasMessages = computed(() => messages.value.length > 0);

const showScrollBottom = ref(false);
let isSmoothScrolling = false;
let scrollResetTimer: ReturnType<typeof setTimeout> | null = null;
let isPinningBottom = false;
let pinBottomTimers: ReturnType<typeof setTimeout>[] = [];

function getContentScrollEl(): HTMLElement | null {
  return dropZoneRef.value?.querySelector<HTMLElement>('[data-slot="content"]') ?? null;
}

function scrollToBottomImmediate() {
  const el = getContentScrollEl();
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
  transcriptRef.value?.scrollToBottom("auto");
}

function stopPinning() {
  if (!isPinningBottom) return;
  isPinningBottom = false;
  pinBottomTimers.forEach(clearTimeout);
  pinBottomTimers = [];
}

function scrollToBottomRightAway() {
  isPinningBottom = true;
  showScrollBottom.value = false;

  pinBottomTimers.forEach(clearTimeout);
  pinBottomTimers = [];

  scrollToBottomImmediate();

  nextTick(() => {
    scrollToBottomImmediate();
    requestAnimationFrame(() => {
      scrollToBottomImmediate();
    });
  });

  const delays = [30, 80, 160, 300];
  delays.forEach((delay) => {
    const timer = setTimeout(() => {
      scrollToBottomImmediate();
      if (delay === 300) {
        isPinningBottom = false;
      }
    }, delay);
    pinBottomTimers.push(timer);
  });
}

watch(
  () => chatStore.currentConversationId,
  (newId) => {
    if (newId && !chatStore.isLoading) {
      scrollToBottomRightAway();
    }
  },
);

function handleContentScroll(e: Event) {
  if (isSmoothScrolling || isPinningBottom) return;
  const el = e.target as HTMLElement;
  if (!el || !/auto|scroll/.test(getComputedStyle(el).overflowY)) return;
  const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
  if (distanceFromBottom > 160) {
    showScrollBottom.value = true;
  } else if (distanceFromBottom < 80) {
    showScrollBottom.value = false;
  }
}

function scrollToBottom() {
  const el = getContentScrollEl();
  if (el) {
    isSmoothScrolling = true;
    showScrollBottom.value = false;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    if (scrollResetTimer) clearTimeout(scrollResetTimer);
    scrollResetTimer = setTimeout(() => {
      isSmoothScrolling = false;
    }, 600);
  } else {
    transcriptRef.value?.scrollToBottom("smooth");
    showScrollBottom.value = false;
  }
}

watch(isOpen, (open) => {
  if (!open) {
    isHistoryOpen.value = false;
    stopPinning();
    return;
  }

  if (hasMessages.value && !chatStore.isLoading) {
    scrollToBottomRightAway();
  } else {
    nextTick(() => {
      transcriptRef.value?.restoreScroll();
    });
  }
});

watch(transcriptRef, (transcript) => {
  if (transcript && chatStore.savedScrollPosition === 0 && !chatStore.isLoading) {
    scrollToBottomRightAway();
  } else if (transcript) {
    nextTick(() => transcript.restoreScroll());
  }
});

onMounted(() => {
  const el = dropZoneRef.value;
  el?.addEventListener("wheel", stopPinning, { passive: true });
  el?.addEventListener("touchstart", stopPinning, { passive: true });
});

onUnmounted(() => {
  const el = dropZoneRef.value;
  el?.removeEventListener("wheel", stopPinning);
  el?.removeEventListener("touchstart", stopPinning);
  stopPinning();
  if (scrollResetTimer) clearTimeout(scrollResetTimer);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-chat-launcher">
      <button v-if="!isOpen" type="button"
        class="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 flex h-14 items-center gap-2.5 rounded-2xl border border-default bg-default px-3 shadow-lg"
        aria-label="Öppna chatten" @click="openChat">
        <ChatMascot class="size-7 shrink-0" />
        <span
          class="flex h-10 min-w-0 flex-1 items-center rounded-lg bg-elevated/40 px-4 text-left text-base text-muted/80">
          Fråga vad som helst
        </span>
      </button>
    </Transition>

    <Transition name="mobile-chat-dialog">
      <div v-if="isOpen" ref="dropZoneRef"
        class="fixed inset-0 z-40 flex h-dvh w-screen flex-col overflow-hidden bg-default" role="dialog"
        aria-modal="true" aria-label="Chatt">
        <Transition name="drop-overlay">
          <ChatDropOverlay v-if="isOverDropZone && !isLoading" />
        </Transition>

        <header class="shrink-0 border-b border-default bg-default pt-[env(safe-area-inset-top,0px)]">
          <div class="flex h-14 items-center gap-1 px-2">
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" class="shrink-0" aria-label="Stäng chatten"
              @click="closeChat" />

            <p class="min-w-0 flex-1 truncate text-sm font-semibold text-highlighted">
              {{ chatHeaderTitle }}
            </p>

            <UButton color="neutral" variant="ghost" icon="i-lucide-plus" aria-label="Ny chatt"
              @click="startNewChat" />
            <UButton color="neutral" variant="ghost" icon="i-lucide-history" aria-label="Historik"
              @click="toggleHistory" />
          </div>
        </header>

        <UChatPalette
          :ui="{
            root: 'relative flex-1 min-h-0 min-w-0 overflow-hidden',
            content: 'h-full overflow-y-auto overflow-x-hidden overscroll-y-contain py-0',
            prompt: 'border-t-0 p-0',
          }"
          @scroll.capture.passive="handleContentScroll"
        >
          <LazyChatMessages ref="transcriptRef" :messages="messages" :is-loading="isLoading" content-class="pt-4 pb-36"
            :enable-selection-popover="false" @reply-to-selection="handleReplyToSelection" />

          <template #prompt>
            <div class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center bg-gradient-to-t from-default via-default/85 to-transparent pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
              <Transition name="fade-up">
                <UButton
                  v-if="showScrollBottom"
                  icon="i-lucide-arrow-down"
                  class="pointer-events-auto mb-2 shadow-md"
                  aria-label="Rulla till senaste"
                  @click="scrollToBottom"
                />
              </Transition>

              <ChatInput ref="chatInputRef" class="pointer-events-auto mx-auto w-full max-w-2xl" :initial-text="chatStore.draftInput"
                :initial-attachments="chatStore.draftAttachments" :is-loading="isLoading"
                :selected-model-id="selectedModelId" :web-search="webSearch" :course-code="courseCode"
                :has-solution="hasSolution" :selection-context="selectionContext" show-disclaimer :autofocus="false"
                @send="handleSend" @cancel="handleCancel" @clear-selection-context="selectionContext = ''"
                @update:selected-model-id="selectedModelId = $event" @update:web-search="webSearch = $event" />
            </div>
          </template>
        </UChatPalette>
      </div>
    </Transition>

    <ChatHistoryDialog v-model:open="isHistoryOpen" @select="scrollToBottomRightAway" />
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

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
