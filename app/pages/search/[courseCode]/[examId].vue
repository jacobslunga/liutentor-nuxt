<script setup lang="ts">
import { useLayoutStore } from "~/stores/layout";

definePageMeta({ layout: false });

const route = useRoute();
const layoutStore = useLayoutStore();
const { layoutMode } = storeToRefs(layoutStore);
const chatStore = useChatStore();

const examId = computed(() => route.params.examId as string);
const courseCode = computed(() => route.params.courseCode as string);

const { data: examData, status } = useFetch(
  () => `/api/exams/detail/${examId.value}`,
  {
    key: () => `exam-detail-${examId.value}`,
    lazy: true,
  },
);
const { data: courseData } = useFetch(() => `/api/exams/${courseCode.value}`, {
  key: () => `course-exams-${courseCode.value}`,
  lazy: true,
});

const exams = computed(() => (courseData.value as any)?.data?.exams ?? []);
const exam = computed(() => (examData.value as any)?.data?.exam);
const solution = computed(() => (examData.value as any)?.data?.solution);
const solutionPdfUrl = computed(() => solution.value?.pdf_url ?? null);
const hasFacit = computed(() => !!solutionPdfUrl.value);

const isLoading = computed(() => status.value === "pending");
const isError = computed(
  () => status.value === "error" || (!isLoading.value && !exam.value),
);

// Registered once with reactive getters. Calling useSeoMeta inside a watcher
// registers a *new* head entry per run — and since the fetch is lazy it ran at
// least twice, with the later runs outside the setup context.
useSeoMeta({
  title: () =>
    exam.value
      ? `${exam.value.course_code} - Tenta ${exam.value.exam_date}`
      : "Tenta",
  description: () =>
    exam.value
      ? `Se tenta för ${exam.value.course_code} från ${exam.value.exam_date}`
      : "",
  robots: "noindex, nofollow",
});

// The two layout modes used to live in separate component trees behind a
// v-if, so flipping the switcher tore down both PDF viewers (re-downloading
// and re-parsing each document) and the chat panel. They are one tree now:
// only the facit presentation differs, and the exam viewer and chat panel are
// rendered in the same position either way, so they survive the toggle.
const isExamOnly = computed(() => layoutMode.value === "exam-only");

const isMobile = ref(import.meta.client ? window.innerWidth < 1024 : false);

// Split mode
const SPLIT_MIN = 20;
const SPLIT_MAX = 80;
/** Percentage points the split moves per arrow-key press. */
const SPLIT_KEY_STEP = 2;

const splitPercent = ref(55);
const isResizing = ref(false);
const solutionBlurred = ref(true);

function clampSplit(percent: number) {
  return Math.min(Math.max(percent, SPLIT_MIN), SPLIT_MAX);
}

// Exam-only mode: facit slides in as an overlay on approach to the right edge
const isFacitVisible = ref(false);
const isFacitManual = ref(false);
const facitProximity = ref(0);

// Shared by the facit overlay and the chat panel, as it was in exam-only mode.
const overlayWidth = ref(import.meta.client ? window.innerWidth / 2 : 600);
const isOverlayResizing = ref(false);

const chatHasBeenOpened = ref(false);

watch(
  () => chatStore.isOpen,
  (open) => {
    if (!open) return;
    isFacitVisible.value = false;
    isFacitManual.value = false;
    if (!chatHasBeenOpened.value) chatHasBeenOpened.value = true;
  },
);

let activeResizeCleanup: (() => void) | null = null;

function beginDrag(onMove: (e: MouseEvent) => void, onDone: () => void) {
  activeResizeCleanup?.();
  const move = (e: MouseEvent) => onMove(e);
  const up = () => {
    onDone();
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
    activeResizeCleanup = null;
  };
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  activeResizeCleanup = up;
}

function startSplitResize() {
  isResizing.value = true;
  beginDrag(
    (e) => {
      splitPercent.value = clampSplit((e.clientX / window.innerWidth) * 100);
    },
    () => {
      isResizing.value = false;
    },
  );
}

function startOverlayResize() {
  isOverlayResizing.value = true;
  beginDrag(
    (e) => {
      overlayWidth.value = Math.max(
        300,
        Math.min(window.innerWidth - e.clientX, window.innerWidth * 0.85),
      );
    },
    () => {
      isOverlayResizing.value = false;
    },
  );
}

// Drives FacitEdge, which used to run a second window mousemove listener
// recomputing the same viewport geometry on every move.
function handleMouseMove(e: MouseEvent) {
  if (
    !isExamOnly.value ||
    !hasFacit.value ||
    isFacitManual.value ||
    isOverlayResizing.value ||
    chatStore.isOpen
  )
    return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const safeZone = h * 0.25;
  const inSafeZone = e.clientY < safeZone || e.clientY > h - safeZone;

  const proximityStart = w * 0.7;
  facitProximity.value =
    e.clientX > proximityStart && !inSafeZone
      ? Math.min(Math.max((e.clientX - proximityStart) / (w - proximityStart), 0), 1)
      : 0;

  if (inSafeZone && !isFacitVisible.value) return;
  if (!isFacitVisible.value && e.clientY < 80) return;

  // The overlay is `fixed right-0 bottom-0 h-screen` with an explicit width, so
  // its box is fully known — measuring it with getBoundingClientRect forced a
  // synchronous layout on every mousemove, over two live PDF viewports.
  if (isFacitVisible.value && e.clientX >= w - overlayWidth.value - 40) return;

  isFacitVisible.value = e.clientX > w * 0.92 && !inSafeZone;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.defaultPrevented) return;

  if (e.key === "Escape") {
    if (chatStore.isOpen && chatStore.isHistoryOpen) {
      e.preventDefault();
      chatStore.isHistoryOpen = false;
      return;
    }
    isFacitManual.value = false;
    isFacitVisible.value = false;
    chatStore.close();
    return;
  }

  if (chatStore.isOpen) return;

  // The chat input keeps DOM focus after the panel is closed, so without this
  // the single-letter shortcuts also type themselves into the draft. Escape is
  // handled above and must keep working from inside the input.
  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.isContentEditable ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA")
  ) {
    return;
  }

  // Nudge the divider, in the same range the drag handle uses. Exam-only has
  // no divider to move, and the panes resizing drives the zoom through the
  // usual viewport-resize path, so the documents rescale as they would on a
  // drag. Repeats are deliberately not filtered: holding the key should keep
  // moving it.
  if (!isExamOnly.value && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    splitPercent.value = clampSplit(
      splitPercent.value + (e.key === "ArrowRight" ? SPLIT_KEY_STEP : -SPLIT_KEY_STEP),
    );
    return;
  }

  // Both shortcuts must preventDefault: opening the chat focuses its input
  // within the same keystroke, so the character would otherwise be inserted
  // into the freshly focused draft.
  if (e.key === "c") {
    e.preventDefault();
    chatStore.open();
    return;
  }

  if (e.key.toLowerCase() === "e") {
    e.preventDefault();
    if (isExamOnly.value) {
      isFacitVisible.value = !isFacitVisible.value;
      isFacitManual.value = isFacitVisible.value;
    } else {
      solutionBlurred.value = !solutionBlurred.value;
    }
  }
}

// Single teardown path. This previously ran from both onBeforeRouteUpdate and
// a watcher on the same route param, so every exam-to-exam navigation did the
// whole reset twice.
function resetChatForNewExam() {
  chatStore.close();
  chatStore.clearChat();
  chatHasBeenOpened.value = false;
  isFacitVisible.value = false;
  isFacitManual.value = false;
}

onBeforeRouteUpdate((to, from) => {
  if (to.params.examId !== from.params.examId) {
    resetChatForNewExam();
  }
});

onBeforeRouteLeave(() => {
  chatStore.close();
  chatStore.clearChat();
});

function handleResize() {
  isMobile.value = window.innerWidth < 1024;
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("keydown", handleKeyDown);
  activeResizeCleanup?.();
});
</script>

<template>
  <ClientOnly>
    <div class="relative h-screen w-full overflow-hidden bg-background">
      <div v-if="exam" class="hidden lg:block absolute inset-x-0 top-0 z-70">
        <div
          class="pointer-events-none absolute inset-x-0 -top-10 h-24 -z-10 bg-linear-to-b from-background via-background to-background/0" />
        <ExamHeader :exams="exams" :exam-id="examId" :course-code="courseCode" :solution-pdf-url="solutionPdfUrl" />
      </div>

      <div v-if="isLoading" class="flex h-full items-center justify-center flex-col gap-2 bg-background">
        <LucideLoader2 class="w-8 h-8 animate-spin text-muted-foreground" />
        <p class="text-sm text-muted-foreground">Laddar tenta...</p>
      </div>

      <div v-else-if="isError" class="flex h-full items-center justify-center flex-col gap-2 bg-background">
        <p class="text-2xl text-foreground/80">Något gick fel!</p>
        <p class="text-sm text-muted-foreground">
          Ibland fungerar det att bara ladda om sidan :)
        </p>
        <Button variant="secondary" @click="refreshNuxtData()">Ladda om</Button>
      </div>

      <template v-else-if="exam">
        <MobilePdfView v-if="isMobile" class="bg-background" :exam-pdf-url="exam.pdf_url"
          :solution-pdf-url="solutionPdfUrl" :course-code="courseCode" :exam-date="exam.exam_date" />

        <div v-else class="h-full flex flex-row overflow-hidden bg-background"
          :class="{ 'select-none': isResizing || isOverlayResizing }">
          <!-- Exam viewer. Same vnode position in both modes on purpose: this is
               what lets the document survive a layout switch. -->
          <div class="relative h-full overflow-hidden"
            :style="isExamOnly ? { width: '100%' } : { width: `${splitPercent}%` }">
            <LazyPdfRenderer :pdf-url="exam.pdf_url" :layout-mode="layoutMode" :top-inset="64" />

            <FacitEdge v-if="isExamOnly && hasFacit && !isFacitVisible && !chatStore.isOpen"
              :facit-pdf-url="solutionPdfUrl" :intensity="facitProximity" />
          </div>

          <template v-if="!isExamOnly">
            <div class="relative z-60 w-0 shrink-0">
              <ResizeHandle :is-resizing="isResizing" @start-resize="startSplitResize" />
            </div>

            <div class="relative h-full flex-1 min-w-0 overflow-hidden bg-background">
              <div class="absolute inset-0 h-full w-full flex flex-col">
                <div v-if="solution" class="h-full relative" @mouseenter="solutionBlurred = false"
                  @mouseleave="solutionBlurred = true">
                  <LazyPdfRenderer :pdf-url="solution.pdf_url" layout-mode="exam-with-facit" :top-inset="64" />
                  <Transition name="fade">
                    <div v-if="solutionBlurred"
                      class="absolute inset-0 z-50 backdrop-blur-sm bg-background/30 flex flex-col gap-2 items-center justify-center pointer-events-none">
                      <p class="text-sm font-normal text-muted-foreground">
                        Håll muspekaren för att visa facit
                      </p>
                      <LucideMousePointerClick class="text-muted-foreground animate-in" />
                    </div>
                  </Transition>
                </div>

                <div v-else class="flex h-full items-center justify-center p-6">
                  <div class="group relative w-full max-w-sm">
                    <div
                      class="rounded-md border-2 border-dashed border-border/60 px-8 py-10 transition-colors group-hover:border-primary/30">
                      <div class="flex flex-col items-center text-center gap-4">
                        <div
                          class="flex size-12 items-center justify-center rounded-md bg-muted/60 group-hover:bg-primary/10 transition-colors">
                          <LucideUpload
                            class="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p class="font-medium text-foreground/80">
                            Inget facit tillgängligt
                          </p>
                          <p class="mt-1 text-xs text-muted-foreground/70 max-w-55 leading-relaxed">
                            Hjälp andra studenter genom att ladda upp facit till
                            denna tenta.
                          </p>
                        </div>
                        <NuxtLink to="/upload-exams">
                          <Button size="sm" variant="outline">
                            <LucideUpload class="size-3.5" />
                            Ladda upp
                          </Button>
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <Teleport to="body">
          <!-- Facit overlay, exam-only mode -->
          <Transition enter-active-class="transition-all duration-200 ease-spring"
            enter-from-class="translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100 blur-0"
            leave-active-class="transition-all duration-200 ease-spring"
            leave-from-class="translate-x-0 opacity-100 blur-0" leave-to-class="translate-x-full opacity-0 blur-sm">
            <div v-if="!isMobile && isExamOnly && hasFacit"
              v-show="isFacitVisible && !chatStore.isOpen"
              class="fixed right-0 bottom-0 z-70 flex h-screen shadow-xl bg-background"
              :class="{ 'select-none': isOverlayResizing }" :style="{ width: `${overlayWidth}px` }">
              <div class="relative z-100 w-0 shrink-0">
                <ResizeHandle :is-resizing="isOverlayResizing" @start-resize="startOverlayResize" />
              </div>
              <div class="flex-1 overflow-hidden">
                <LazyPdfRenderer :pdf-url="solutionPdfUrl!" layout-mode="exam-only" />
              </div>
            </div>
          </Transition>

          <!-- Chat panel. Rendered outside the mode branches so it is not torn
               down and rebuilt when the layout switcher flips. -->
          <Transition enter-active-class="transition-all duration-200 ease-spring"
            enter-from-class="translate-x-full opacity-0" enter-to-class="translate-x-0 opacity-100 blur-0"
            leave-active-class="transition-all duration-200 ease-spring"
            leave-from-class="translate-x-0 opacity-100 blur-0" leave-to-class="translate-x-full opacity-0 blur-sm">
            <div v-if="!isMobile && chatHasBeenOpened" v-show="chatStore.isOpen"
              class="fixed right-0 bottom-0 z-80 flex h-screen shadow-xl bg-background"
              :class="{ 'select-none': isOverlayResizing }" :style="{ width: `${overlayWidth}px` }">
              <div class="relative z-100 w-0 shrink-0">
                <ResizeHandle :is-resizing="isOverlayResizing" @start-resize="startOverlayResize" />
              </div>
              <div class="flex-1 overflow-hidden">
                <LazyChatWindow :key="examId" :exam-id="examId" :exam-url="exam.pdf_url" :course-code="courseCode"
                  :solution-url="solutionPdfUrl" :has-solution="hasFacit" class="h-full w-full"
                  @close="chatStore.close()" />
              </div>
            </div>
          </Transition>
        </Teleport>
      </template>
    </div>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-spring);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
