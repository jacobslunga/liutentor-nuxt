<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useChatStore } from "@/stores/chat";
import {
  useChatPanel,
  type ChatInputApi,
  type ChatTranscriptApi,
} from "@/composables/useChatPanel";
import { useSheetDetents } from "@/composables/useSheetDetents";

const props = defineProps<{
  examId: string;
  examUrl: string;
  courseCode: string;
  solutionUrl?: string | null;
  hasSolution: boolean;
}>();

const chatStore = useChatStore();
const { isHistoryOpen } = storeToRefs(chatStore);

const chatInputRef = ref<ChatInputApi | null>(null);
const transcriptRef = ref<ChatTranscriptApi | null>(null);
const inputBlockRef = ref<HTMLElement | null>(null);
const showScrollButton = ref(false);

const {
  detent,
  offset,
  restOffset,
  maxOffset,
  viewportHeight,
  isDragging,
  isReady,
  hasMoved,
  snapTo,
  onPointerDown,
} = useSheetDetents();

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

const hasExpanded = ref(false);

const SHEET_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SHEET_DURATION = 320;

const duration = computed(() =>
  isDragging.value || !isReady.value ? 0 : SHEET_DURATION,
);

const motion = computed(
  () =>
    `transform ${duration.value}ms ${SHEET_EASING}, opacity ${duration.value}ms ${SHEET_EASING}`,
);

const sheetStyle = computed(() => ({
  height: viewportHeight.value ? `${viewportHeight.value}px` : "100dvh",
  transform: `translate3d(0, ${offset.value}px, 0)`,
  transition: motion.value,
}));

const inputStyle = computed(() => ({
  transform: `translate3d(0, ${-offset.value}px, 0)`,
  opacity: expandedOpacity.value,
  transition: motion.value,

  // Hidden composer children must not intercept collapsed-sheet gestures.
  visibility: expandedOpacity.value === 0 ? "hidden" : "visible",
}) as const);

const transcriptStyle = computed(() => ({
  paddingBottom: `${restOffset.value}px`,
}));

const expandedOpacity = computed(() => {
  if (maxOffset.value <= 0) return 1;
  return Math.min(Math.max((maxOffset.value - offset.value) / 120, 0), 1);
});

const peekOpacity = computed(() => 1 - expandedOpacity.value);

const isExpanded = computed(() => detent.value !== "peek");

function expand() {
  hasExpanded.value = true;
  snapTo("full");
}

watch(offset, (value) => {
  if (!hasExpanded.value && value < maxOffset.value - 4) {
    hasExpanded.value = true;
  }
});

function collapse() {
  snapTo("peek");
}

function handleHeaderTap(e: MouseEvent) {

  if ((e.target as HTMLElement | null)?.closest("[data-no-drag]")) return;
  if (hasMoved.value || detent.value !== "peek") return;
  expand();
  nextTick(() => chatInputRef.value?.focus());
}

watch(isExpanded, (expanded) => {
  if (chatStore.isOpen !== expanded) chatStore.isOpen = expanded;
});

watch(
  () => chatStore.isOpen,
  (open) => {
    if (open) {
      if (!isExpanded.value) expand();
    } else {
      if (isExpanded.value) collapse();
      isHistoryOpen.value = false;
    }
  },
);

watch(transcriptRef, (transcript) => {
  if (transcript) nextTick(() => transcript.restoreScroll());
});
</script>

<template>
  <Teleport to="body">

    <div
      class="fixed inset-x-0 bottom-0 z-80 flex flex-col overflow-hidden rounded-t-[22px] border-t border-border bg-background shadow-[0_-8px_40px_rgba(0,0,0,0.16)] will-change-transform"
      :style="sheetStyle">

      <div class="relative h-16 shrink-0 touch-none select-none" @pointerdown="onPointerDown"
        @click="handleHeaderTap">
        <div class="absolute inset-x-0 top-2 flex justify-center">
          <div class="h-1 w-9 rounded-full bg-muted-foreground/30" />
        </div>

        <div class="absolute inset-0 flex items-center gap-2.5 px-3 pt-3" role="button" tabindex="0"
          aria-label="Öppna chatten" :style="{ opacity: peekOpacity, transition: motion }"
          :class="peekOpacity === 0 ? 'pointer-events-none' : ''" @keydown.enter.space.prevent="expand()">
          <ChatMascot class="size-7 shrink-0" />
          <div
            class="flex h-10 flex-1 items-center rounded-full border border-border bg-secondary/40 px-4 text-base text-muted-foreground/80">
            Fråga vad som helst
          </div>
        </div>

        <div class="absolute inset-0 flex items-center gap-1 px-2 pt-3"
          :style="{ opacity: expandedOpacity, transition: motion }"
          :class="expandedOpacity === 0 ? 'pointer-events-none' : ''">
          <Button variant="ghost" size="icon-sm" aria-label="Fäll ihop" data-no-drag @click="collapse">
            <LucideChevronDown class="size-4" />
          </Button>
          <p class="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {{ chatHeaderTitle }}
          </p>
          <Button variant="ghost" size="icon-sm" aria-label="Ny chatt" data-no-drag @click="startNewChat">
            <LucidePlus class="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Historik" data-no-drag @click="toggleHistory">
            <LucidePanelRight class="size-4" />
          </Button>
        </div>
      </div>

      <div class="relative min-h-0 flex-1">
        <LazyChatMessages v-if="hasExpanded" ref="transcriptRef" :messages="messages" :is-loading="isLoading"
          :enable-selection-popover="false" :style="transcriptStyle"
          @reply-to-selection="handleReplyToSelection" @update:show-scroll-button="showScrollButton = $event" />
      </div>

      <div ref="inputBlockRef"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-10 pt-10 pb-[env(safe-area-inset-bottom,0px)]"
        :style="inputStyle">
        <div class="fade-to-background pointer-events-none absolute inset-x-0 top-0 bottom-0 -z-10" />
        <ChatInput ref="chatInputRef" :initial-text="chatStore.draftInput" :is-loading="isLoading"
          :give-direct-answer="MOBILE_DIRECT_ANSWER" :selected-model-id="MOBILE_MODEL_ID"
          :show-scroll-button="showScrollButton" :course-code="courseCode" :has-solution="hasSolution"
          :selection-context="selectionContext" :autofocus="false" :submit-on-enter="false" compact @send="handleSend"
          @cancel="handleCancel" @scroll-to-bottom="transcriptRef?.scrollToBottom('smooth')"
          @clear-selection-context="selectionContext = ''" />
      </div>
    </div>

    <ChatHistoryDialog v-model:open="isHistoryOpen" />
  </Teleport>
</template>
