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

useSeoMeta({
  title: () =>
    exam.value
      ? `Lock in - ${exam.value.course_code} ${exam.value.exam_date}`
      : "Lock in - LiU Tentor",
  description: () =>
    exam.value
      ? `Fokuserat tentläge för ${exam.value.course_code} från ${exam.value.exam_date}.`
      : "Fokuserat tentläge på LiU Tentor.",
  robots: "noindex, nofollow",
});

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
  <div class="relative h-screen w-screen overflow-hidden bg-default flex flex-col">
    <div class="absolute top-0 left-0 right-0 z-40 px-4 py-2 flex items-center justify-center pointer-events-none">
      <div
        class="bg-default/80 backdrop-blur-sm border border-default/60 rounded-lg px-4 py-2 flex items-center gap-6 pointer-events-auto">
        <div class="flex items-center gap-3 min-w-30 justify-center">
          <UIcon name="i-lucide-timer" class="w-5 h-5" :class="timeRemaining < 300000
            ? 'text-error animate-pulse'
            : 'text-primary'
            " />
          <span class="font-mono text-xl font-medium tracking-widest tabular-nums">
            {{ formatTime(timeRemaining) }}
          </span>
        </div>

        <div class="flex items-center gap-2 border-l pl-4">
          <UButton color="neutral" variant="ghost" square class="h-8 w-8" @click="toggleFullscreen">
            <UIcon name="i-lucide-minimize" v-if="isFullscreen" class="w-4 h-4" />
            <UIcon name="i-lucide-maximize" v-else class="w-4 h-4" />
          </UButton>

          <UButton color="neutral" variant="ghost" square class="h-8 w-8" :class="paused ? 'text-warning bg-warning/10' : ''"
            @click="handlePauseResume">
            <UIcon name="i-lucide-play" v-if="paused" class="w-4 h-4" />
            <UIcon name="i-lucide-pause" v-else class="w-4 h-4" />
          </UButton>

          <UButton color="error" size="sm" class="h-8 px-3 ml-2" @click="showFinishDialog = true">
            Avsluta
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex-1 w-full h-full pt-14 pb-4 px-4 overflow-hidden">
      <div class="w-full h-full rounded-md overflow-hidden border">
        <ClientOnly>
          <LazyPdfRenderer v-if="exam" :pdf-url="exam.pdf_url" />
        </ClientOnly>
      </div>
    </div>

    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="paused"
        class="absolute inset-0 z-40 bg-default/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
        <div class="p-4 rounded-md bg-warning/10 mb-2">
          <UIcon name="i-lucide-pause" class="w-16 h-16 text-warning" />
        </div>
        <h2 class="text-4xl font-medium">PAUSAD</h2>
        <div class="flex flex-col items-center gap-2">
          <p class="text-muted text-lg">{{ exam?.course_code }}</p>
          <p class="font-mono text-2xl">
            {{ formatTime(timeRemaining) }} återstår
          </p>
        </div>
        <UButton size="lg" class=" px-8 h-12 text-lg gap-2 mt-4" @click="handlePauseResume">
          <UIcon name="i-lucide-play" class="w-5 h-5" />
          Återuppta
        </UButton>
      </div>
    </Transition>

    <UModal :open="showFinishDialog" :dismissible="false" :close="false"
      title="Avsluta Tenta?" description="Är du säker på att du vill lämna in? Du har tid kvar."
      @update:open="showFinishDialog = $event">
      <template #footer>
        <UButton color="neutral" variant="outline" @click="showFinishDialog = false">Avbryt</UButton>
        <UButton color="error" @click="confirmFinish">Avsluta</UButton>
      </template>
    </UModal>

    <UModal :open="showTimeUpDialog" :dismissible="false" :close="false"
      title="Tiden är ute!" description="Bra jobbat! Din session har avslutats.">
      <template #footer>
        <UButton @click="handleTimeUp">Till startsidan</UButton>
      </template>
    </UModal>
  </div>
</template>
