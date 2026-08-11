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

// The composer is one row on a phone, with no room for two dropdowns — so the
// model and answer mode are pinned here instead of offered. Fastest model,
// answers straight out: what a phone session between lectures actually wants.
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

/**
 * The peek bar is always on screen, but the transcript — and with it the whole
 * markdown pipeline (KaTeX, Shiki, mermaid) — only mounts once the sheet is
 * first opened. Mirrors the desktop panel's `chatHasBeenOpened` latch: without
 * it every mobile exam view pays for chat it may never use.
 */
const hasExpanded = ref(false);

const SHEET_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const SHEET_DURATION = 320;

// Zeroed mid-gesture so the sheet tracks the finger exactly, and before the
// first paint so the initial measurement lands without animating.
const duration = computed(() =>
  isDragging.value || !isReady.value ? 0 : SHEET_DURATION,
);

const motion = computed(
  () =>
    `transform ${duration.value}ms ${SHEET_EASING}, opacity ${duration.value}ms ${SHEET_EASING}`,
);

// Sized from the *visual* viewport rather than `100%`/`100dvh`: on iOS the
// layout viewport does not shrink for the keyboard, and a sheet sized to it
// would put its bottom edge — and the input — behind the keys.
const sheetStyle = computed(() => ({
  height: viewportHeight.value ? `${viewportHeight.value}px` : "100dvh",
  transform: `translate3d(0, ${offset.value}px, 0)`,
  transition: motion.value,
}));

// The sheet box is always full height and pushed down, so its own bottom edge
// sits off-screen at every detent but `full`. Counter-translating the input by
// the same amount parks it back on the visible bottom edge.
const inputStyle = computed(() => ({
  transform: `translate3d(0, ${-offset.value}px, 0)`,
  opacity: expandedOpacity.value,
  transition: motion.value,
  // Collapsed, the counter-transform parks the composer exactly on top of the
  // peek bar. Opacity alone still leaves it hit-testable, which swallowed every
  // tap and drag on that bar. `visibility` is what actually removes it — and
  // unlike pointer-events it cannot be re-enabled by ChatInput's own
  // `pointer-events-auto` further down the tree.
  visibility: expandedOpacity.value === 0 ? "hidden" : "visible",
}) as const);

/**
 * Content below this much of the box is under the fold, so the transcript has
 * to stop short of it. Deliberately keyed off the *settled* offset: recomputing
 * it per drag frame would relayout the scroll container on every move, which is
 * exactly what the transform-only approach exists to avoid.
 */
const transcriptStyle = computed(() => ({
  paddingBottom: `${restOffset.value}px`,
}));

/** Fades the input and expanded header in over the first stretch of travel. */
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

// A drag settles through the composable rather than through expand(), so the
// latch is tripped on the first frame the sheet leaves the collapsed rest
// position — the transcript is then mounted by the time the drag lands.
watch(offset, (value) => {
  if (!hasExpanded.value && value < maxOffset.value - 4) {
    hasExpanded.value = true;
  }
});

function collapse() {
  snapTo("peek");
}

/**
 * Collapsed, the whole bar is one big "ask something" button — but it is also
 * the drag surface, so a tap has to be told apart from the click that trails
 * every drag. The handler sits on the drag element itself rather than on the
 * pill: `setPointerCapture` retargets the click to the captured element, so a
 * handler on a child would never see it.
 */
function handleHeaderTap(e: MouseEvent) {
  // Controls opt out of the drag with [data-no-drag]; they have to opt out of
  // the tap too. The collapse button otherwise undid itself — its own handler
  // set the detent to peek, then this one saw peek on the way up and reopened.
  if ((e.target as HTMLElement | null)?.closest("[data-no-drag]")) return;
  if (hasMoved.value || detent.value !== "peek") return;
  expand();
  nextTick(() => chatInputRef.value?.focus());
}

// `isOpen` is the store's cross-component notion of "the chat is showing". On
// mobile that maps onto "not collapsed", which keeps askAboutSelection, the
// route-change resets in the exam page, and resetOnLogout all working unchanged.
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

// The transcript mounts lazily, so the restore the panel composable queues on
// mount lands on nothing. Do it when the component actually appears.
watch(transcriptRef, (transcript) => {
  if (transcript) nextTick(() => transcript.restoreScroll());
});
</script>

<template>
  <Teleport to="body">
    <!-- No scrim: the sheet shares the screen with the PDF rather than taking
         it over, and a backdrop-filter behind a transform that moves every
         frame was the single most expensive thing in the drag. Collapsing is
         the grabber, a downward drag, or the chevron at full. -->
    <div
      class="fixed inset-x-0 bottom-0 z-80 flex flex-col overflow-hidden rounded-t-[22px] border-t border-border bg-background shadow-[0_-8px_40px_rgba(0,0,0,0.16)] will-change-transform"
      :style="sheetStyle">
      <!-- Drag region. `touch-action: none` is what stops the browser claiming
           the gesture as a scroll before the pointer handler sees it. -->
      <div class="relative h-16 shrink-0 touch-none select-none" @pointerdown="onPointerDown"
        @click="handleHeaderTap">
        <div class="absolute inset-x-0 top-2 flex justify-center">
          <div class="h-1 w-9 rounded-full bg-muted-foreground/30" />
        </div>

        <!-- Collapsed: a stand-in for the input, so the affordance reads as
             "ask something" rather than "there is a panel here". The whole bar
             is the tap target, and also the primary drag surface — `hasMoved`
             is what keeps the click that trails a drag from firing it. -->
        <div class="absolute inset-0 flex items-center gap-2.5 px-3 pt-3" role="button" tabindex="0"
          aria-label="Öppna chatten" :style="{ opacity: peekOpacity, transition: motion }"
          :class="peekOpacity === 0 ? 'pointer-events-none' : ''" @keydown.enter.space.prevent="expand()">
          <ChatMascot class="size-7 shrink-0" />
          <div
            class="flex h-10 flex-1 items-center rounded-full border border-border bg-secondary/40 px-4 text-base text-muted-foreground/80">
            Fråga vad som helst
          </div>
        </div>

        <!-- Expanded. One variant only, now that the sheet is either open or shut. -->
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

      <!-- pointer-events-none so the gradient run-up above the composer does not
           swallow taps meant for the transcript; ChatInput's own root turns them
           back on for the composer itself. -->
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
