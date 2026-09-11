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
    if (hasMessages.value && !chatStore.isLoading) {
      scrollToBottomRightAway();
    }
  } else {
    isHistoryOpen.value = false;
    stopPinning();
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

watch(transcriptRef, (transcript) => {
  if (transcript && chatStore.savedScrollPosition === 0 && !chatStore.isLoading) {
    scrollToBottomRightAway();
  }
});

function handleContentScroll(e: Event) {
  if (isSmoothScrolling || isPinningBottom) return;
  const el = e.target as HTMLElement;
  if (!el || !/auto|scroll/.test(getComputedStyle(el).overflowY)) return;
  const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
  // Hysteresis prevents flickering near the threshold
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

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown, true);
  const el = dropZoneRef.value;
  el?.addEventListener("wheel", stopPinning, { passive: true });
  el?.addEventListener("touchstart", stopPinning, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown, true);
  const el = dropZoneRef.value;
  el?.removeEventListener("wheel", stopPinning);
  el?.removeEventListener("touchstart", stopPinning);
  stopPinning();
  if (scrollResetTimer) clearTimeout(scrollResetTimer);
});

defineExpose({ focusInput: () => chatInputRef.value?.focus() });
</script>

<template>
  <div ref="dropZoneRef" class="relative flex h-full w-full flex-col overflow-hidden bg-default">
    <Transition name="drop-overlay">
      <ChatDropOverlay v-if="isOverDropZone && !isLoading" />
    </Transition>

    <div class="pointer-events-none absolute inset-x-0 top-0 z-20">
      <ChatHeader :has-solution="hasSolution" :title="chatHeaderTitle" :history-open="isHistoryOpen"
        @close="emit('close')" @open-history="toggleHistory" @new-chat="startNewChat" />
    </div>

    <UChatPalette :ui="{
      root: 'relative flex-1 min-h-0 min-w-0 overflow-hidden',
      content: 'h-full overflow-y-auto overflow-x-hidden overscroll-y-contain py-0',
      prompt: 'border-t-0 p-0',
    }" @scroll.capture.passive="handleContentScroll">
      <div v-if="!hasMessages"
        class="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-28 text-center">
        <ChatMascot class="size-14 shrink-0" />
        <div class="space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            Vad kan jag hjälpa till med?
          </h2>
          <p class="mx-auto max-w-70 text-sm leading-relaxed text-muted sm:max-w-md">
            Ställ frågor om tentan eller få hjälp att förstå lösningarna.
          </p>
        </div>
        <NuxtLink to="/ai-policy" target="_blank"
          class="mt-2 border-b border-transparent pb-0.5 text-2xs text-dimmed transition-colors hover:border-muted hover:text-default">
          Läs vår AI-policy
        </NuxtLink>
      </div>

      <ChatMessages v-else ref="transcriptRef" :messages="messages" :is-loading="isLoading"
        content-class="pt-16 pb-36 sm:pb-44" @reply-to-selection="handleReplyToSelection" />

      <template #prompt>
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center bg-linear-to-t from-default via-default/85 to-transparent pt-10 pb-3 sm:pb-4">
          <Transition name="fade-up">
            <UButton v-if="showScrollBottom" variant="subtle" color="neutral" icon="i-lucide-arrow-down"
              class="pointer-events-auto mb-2.5 shadow-md" aria-label="Rulla till senaste" @click="scrollToBottom" />
          </Transition>

          <ChatInput ref="chatInputRef" class="pointer-events-auto mx-auto w-full max-w-2xl 3xl:max-w-3xl"
            :initial-text="chatStore.draftInput" :initial-attachments="chatStore.draftAttachments"
            :is-loading="isLoading" :selected-model-id="selectedModelId" :web-search="webSearch"
            :course-code="courseCode" :has-solution="hasSolution" :selection-context="selectionContext" show-disclaimer
            @send="handleSend" @cancel="handleCancel" @update:selected-model-id="selectedModelId = $event"
            @update:web-search="webSearch = $event" @clear-selection-context="selectionContext = ''" />
        </div>
      </template>
    </UChatPalette>

    <ChatHistoryDialog v-model:open="isHistoryOpen" @select="scrollToBottomRightAway" />
  </div>
</template>

<style scoped>
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
