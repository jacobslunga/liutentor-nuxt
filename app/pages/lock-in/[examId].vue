<script setup lang="ts">
definePageMeta({ layout: "default" });

const route = useRoute();
const router = useRouter();
const {
  getCurrentSession,
  getTimeRemaining,
  pauseSession,
  resumeSession,
  completeSession,
  handleExpiredSession,
  isPaused,
} = useLockInMode();

const examId = computed(() => route.params.examId as string);
const session = getCurrentSession();

const { data: examData } = useFetch(() => `/api/exams/detail/${examId.value}`);
const exam = computed(() => (examData.value as any)?.data?.exam);

useSeoMeta({ robots: "noindex, nofollow" });

onMounted(() => {
  if (!session || session.examId !== examId.value) {
    router.replace("/");
  }
});

const timeRemaining = ref(getTimeRemaining());
const paused = ref(isPaused());
const showFinishDialog = ref(false);
const showTimeUpDialog = ref(false);
const isFullscreen = ref(false);

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    const remaining = getTimeRemaining();
    timeRemaining.value = remaining;
    paused.value = isPaused();
    if (remaining <= 0) {
      showTimeUpDialog.value = true;
      if (timer) clearInterval(timer);
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

function handlePauseResume() {
  if (paused.value) {
    resumeSession();
  } else {
    pauseSession();
  }
  paused.value = !paused.value;
}

function returnToExam() {
  const s = getCurrentSession() || session;
  if (s?.courseCode && s?.examId) {
    router.replace(`/search/${s.courseCode}/${s.examId}`);
  } else {
    router.replace("/");
  }
}

function confirmFinish() {
  completeSession();
  returnToExam();
}

function handleTimeUp() {
  if (session) handleExpiredSession(session);
  showTimeUpDialog.value = false;
  returnToExam();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
</script>

<template>
  <div
    class="relative h-screen w-screen overflow-hidden bg-background flex flex-col"
  >
    <div
      class="absolute top-0 left-0 right-0 z-40 px-4 py-2 flex items-center justify-center pointer-events-none"
    >
      <div
        class="bg-background/80 backdrop-blur-md border border-border/60 shadow-sm rounded-full px-4 py-2 flex items-center gap-6 pointer-events-auto"
      >
        <div class="flex items-center gap-3 min-w-30 justify-center">
          <LucideTimer
            class="w-5 h-5"
            :class="
              timeRemaining < 300000
                ? 'text-red-500 animate-pulse'
                : 'text-primary'
            "
          />
          <span
            class="font-mono text-xl font-semibold tracking-widest tabular-nums"
          >
            {{ formatTime(timeRemaining) }}
          </span>
        </div>

        <div class="flex items-center gap-2 border-l pl-4">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="toggleFullscreen"
          >
            <LucideMinimize v-if="isFullscreen" class="w-4 h-4" />
            <LucideMaximize v-else class="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            :class="paused ? 'text-yellow-500 bg-yellow-500/10' : ''"
            @click="handlePauseResume"
          >
            <LucidePlay v-if="paused" class="w-4 h-4 fill-current" />
            <LucidePause v-else class="w-4 h-4 fill-current" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            class="h-8 px-3 ml-2"
            @click="showFinishDialog = true"
          >
            Avsluta
          </Button>
        </div>
      </div>
    </div>

    <div class="flex-1 w-full h-full pt-14 pb-4 px-4 overflow-hidden">
      <div class="w-full h-full rounded-xl overflow-hidden shadow-2xl border">
        <ClientOnly>
          <PdfRenderer v-if="exam" :pdf-url="exam.pdf_url" />
        </ClientOnly>
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="paused"
        class="absolute inset-0 z-50 bg-background/60 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
      >
        <div class="p-4 rounded-lg bg-yellow-500/10 mb-2">
          <LucidePause class="w-16 h-16 text-yellow-500 fill-current" />
        </div>
        <h2 class="text-4xl font-normal tracking-tight">PAUSAD</h2>
        <div class="flex flex-col items-center gap-2">
          <p class="text-muted-foreground text-lg">{{ exam?.course_code }}</p>
          <p class="font-mono text-2xl">
            {{ formatTime(timeRemaining) }} återstår
          </p>
        </div>
        <Button
          size="lg"
          class="rounded-full px-8 h-12 text-lg gap-2 mt-4"
          @click="handlePauseResume"
        >
          <LucidePlay class="w-5 h-5 fill-current" />
          Återuppta
        </Button>
      </div>
    </Transition>

    <AlertDialog
      :open="showFinishDialog"
      @update:open="showFinishDialog = $event"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Avsluta Tenta?</AlertDialogTitle>
          <AlertDialogDescription>
            Är du säker på att du vill lämna in? Du har tid kvar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showFinishDialog = false"
            >Avbryt</AlertDialogCancel
          >
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmFinish"
          >
            Avsluta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog :open="showTimeUpDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tiden är ute!</AlertDialogTitle>
          <AlertDialogDescription>
            Bra jobbat! Din session har avslutats.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleTimeUp"
            >Till startsidan</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
