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

const isLoading = computed(() => status.value === "pending");
const isError = computed(
  () => status.value === "error" || (!isLoading.value && !exam.value),
);

watchEffect(() => {
  if (!exam.value) return;
  useSeoMeta({
    title: `${exam.value.course_code} - Tenta ${exam.value.exam_date}`,
    description: `Se tenta för ${exam.value.course_code} från ${exam.value.exam_date}`,
    robots: "noindex, nofollow",
  });
});

const isMobile = ref(import.meta.client ? window.innerWidth < 1024 : false);
const solutionBlurred = ref(true);
const splitPercent = ref(55);
const isResizing = ref(false);
const chatHasBeenOpened = ref(false);

watch(
  () => chatStore.isOpen,
  (open) => {
    if (open && !chatHasBeenOpened.value) chatHasBeenOpened.value = true;
  },
);

const chatPanelWidth = ref(
  import.meta.client ? window.innerWidth / 2 : 600,
);
const isChatResizing = ref(false);

function startChatResize() {
  isChatResizing.value = true;
  const onMouseMove = (e: MouseEvent) => {
    const newWidth = window.innerWidth - e.clientX;
    chatPanelWidth.value = Math.max(
      300,
      Math.min(newWidth, window.innerWidth * 0.85),
    );
  };
  const onMouseUp = () => {
    isChatResizing.value = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

onBeforeRouteUpdate((to, from) => {
  if (to.params.examId !== from.params.examId) {
    chatStore.close();
    chatStore.clearChat();
    chatHasBeenOpened.value = false;
  }
});

onBeforeRouteLeave(() => {
  chatStore.close();
  chatStore.clearChat();
});

watch(
  () => route.params.examId,
  () => {
    chatStore.close();
    chatStore.clearChat();
    chatHasBeenOpened.value = false;
  },
);

onMounted(() => {
  isMobile.value = window.innerWidth < 1024;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 1024;
  });
  document.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keyup", handleKeyUp);
});

function startResize() {
  isResizing.value = true;
  function onMouseMove(e: MouseEvent) {
    const percent = (e.clientX / window.innerWidth) * 100;
    splitPercent.value = Math.min(Math.max(percent, 20), 80);
  }
  function onMouseUp() {
    isResizing.value = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleKeyUp(e: KeyboardEvent) {
  if (chatStore.isOpen) return;
  if (e.key === "c") {
    chatStore.open();
  }
  if (e.key === "e") {
    solutionBlurred.value = !solutionBlurred.value;
  }
}
</script>

<template>
  <ClientOnly>
    <div class="relative h-screen w-full overflow-hidden bg-background">
      <div v-if="exam" class="hidden lg:block absolute inset-x-0 top-0 z-70">
        <div
          class="pointer-events-none absolute inset-x-0 -top-10 h-24 -z-10 bg-linear-to-b from-background via-background to-background/0" />
        <ExamHeader :exams="exams" :exam-id="examId" :course-code="courseCode"
          :solution-pdf-url="solutionPdfUrl" />
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
          :class="{ 'select-none': isResizing }">
          <ExamOnlyView v-if="layoutMode === 'exam-only'" :exam-pdf-url="exam.pdf_url"
            :solution-pdf-url="solutionPdfUrl" />

          <template v-else>
            <div class="h-full overflow-hidden" :style="{ width: `${splitPercent}%` }">
              <PdfRenderer :pdf-url="exam.pdf_url" layout-mode="exam-with-facit" :top-inset="64" />
            </div>

            <div class="relative z-60 w-0 shrink-0">
              <ResizeHandle :is-resizing="isResizing" @start-resize="startResize" />
            </div>

            <div class="relative h-full flex-1 min-w-0 overflow-hidden bg-background">
              <div class="absolute inset-0 h-full w-full flex flex-col">
                <template v-if="solution">
                  <div class="h-full relative" @mouseenter="solutionBlurred = false"
                    @mouseleave="solutionBlurred = true">
                    <PdfRenderer :pdf-url="solution.pdf_url" layout-mode="exam-with-facit" :top-inset="64" />
                    <Transition name="fade">
                      <div v-if="solutionBlurred"
                        class="absolute inset-0 z-50 backdrop-blur-md bg-background/30 flex flex-col gap-2 items-center justify-center pointer-events-none">
                        <p class="text-sm font-normal text-muted-foreground">
                          Håll muspekaren för att visa facit
                        </p>
                        <LucideMousePointerClick class="text-muted-foreground animate-in" />
                      </div>
                    </Transition>
                  </div>
                </template>

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

            <Teleport to="body">
              <Transition enter-active-class="transition-transform duration-100 ease-out"
                enter-from-class="translate-x-full" enter-to-class="translate-x-0"
                leave-active-class="transition-transform duration-100 ease-out"
                leave-from-class="translate-x-0" leave-to-class="translate-x-full">
                <div v-if="chatHasBeenOpened" v-show="chatStore.isOpen"
                  class="fixed right-0 bottom-0 z-80 flex h-screen bg-background shadow-2xl"
                  :class="{ 'select-none': isChatResizing }" :style="{ width: `${chatPanelWidth}px` }">
                  <div class="relative z-100 w-0 shrink-0">
                    <ResizeHandle :is-resizing="isChatResizing" @start-resize="startChatResize" />
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <ChatWindow :exam-id="examId" :exam-url="exam.pdf_url" :course-code="courseCode"
                      :solution-url="solutionPdfUrl" :has-solution="!!solution" class="h-full w-full"
                      @close="chatStore.close()" />
                  </div>
                </div>
              </Transition>
            </Teleport>
          </template>
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s var(--ease-spring);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
