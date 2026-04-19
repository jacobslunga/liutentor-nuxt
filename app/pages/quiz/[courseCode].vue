<script setup lang="ts">
import type { Exam, MultipleChoiceQuizResponse } from "@/types/quiz";
import { useQuiz } from "@/composables/useQuiz";
import { useQuizHistory } from "@/composables/useQuizHistory";

definePageMeta({ layout: "default" });

const route = useRoute();
const courseCode = computed(() =>
  (route.params.courseCode as string).toUpperCase(),
);

useSeoMeta({
  title: () => `${courseCode.value} Quiz | Tentor`,
  description: "Träna på ett AI-genererat quiz med tidigare tentor.",
});

type Stage = "setup" | "generating" | "answering" | "results";

const stage = ref<Stage>("setup");
const activeQuizData = ref<MultipleChoiceQuizResponse | null>(null);
const activeQuizId = ref<string | null>(null);
const completedAnswers = ref<Record<number, number>>({});
const user = useSupabaseUser();
const hasAutoLoadedLatest = ref(false);
const historyEnabled = computed(() =>
  Boolean((user.value as any)?.id ?? (user.value as any)?.sub),
);

const { quizData, isLoading, error, status, generateQuiz, reset } =
  useQuiz(courseCode);
const { courseHistory, findById, refresh } = useQuizHistory(courseCode);

const { data: examsData, status: examsStatus } = useFetch<{
  data: { exams: Exam[] };
}>(`/api/exams/${courseCode.value}`, { key: `exams-${courseCode.value}` });

const exams = computed(
  () => (examsData.value as any)?.data?.exams ?? examsData.value ?? [],
);
const examsLoading = computed(() => examsStatus.value === "pending");

watch(courseCode, () => {
  stage.value = "setup";
  activeQuizData.value = null;
  activeQuizId.value = null;
  completedAnswers.value = {};
  hasAutoLoadedLatest.value = false;
  reset();
});

watch(
  [courseHistory, historyEnabled],
  ([history, enabled]) => {
    if (!enabled) return;
    if (hasAutoLoadedLatest.value) return;
    const latest = history[0];
    if (!latest) return;

    activeQuizData.value = latest.data;
    activeQuizId.value = latest.id;
    stage.value = "answering";
    hasAutoLoadedLatest.value = true;
  },
  { immediate: true },
);

watch(quizData, async (data) => {
  if (!data?.quiz?.questions?.length) return;
  activeQuizData.value = data;

  if (historyEnabled.value) {
    await refresh();
    const latest = courseHistory.value[0];
    activeQuizId.value = latest?.id ?? null;
  } else {
    activeQuizId.value = null;
  }

  if (!isLoading.value) stage.value = "answering";
});

watch(isLoading, (loading) => {
  if (!loading && quizData.value) stage.value = "answering";
});

async function handleGenerate(payload: {
  examIds: number[];
  customPrompt?: string;
}) {
  activeQuizData.value = null;
  completedAnswers.value = {};
  stage.value = "generating";
  await generateQuiz(payload);
}

function handleLoadHistory(id: string) {
  const item = findById(id);
  if (!item) return;
  reset();
  activeQuizData.value = item.data;
  activeQuizId.value = id;
  completedAnswers.value = {};
  stage.value = "answering";
}

function handleComplete(answers: Record<number, number>) {
  completedAnswers.value = answers;
  stage.value = "results";
}

function handleRetake() {
  completedAnswers.value = {};
  stage.value = "answering";
}

function handleNewQuiz() {
  stage.value = "setup";
}

function handleAdjustSetup() {
  stage.value = "setup";
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <QuizNavBar
      :course-code="courseCode"
      :stage="stage"
      :history="courseHistory"
      :history-enabled="historyEnabled"
      :active-quiz-id="activeQuizId"
      @load-history="handleLoadHistory"
      @new-quiz="handleNewQuiz"
    />

    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <QuizSetup
        v-if="stage === 'setup'"
        :exams="exams"
        :exams-loading="examsLoading"
        :is-loading="isLoading"
        @generate="handleGenerate"
      />

      <QuizGenerating
        v-else-if="stage === 'generating'"
        :status-message="status?.message ?? 'Förbereder quiz...'"
        :status-step="status?.step ?? null"
        :error="error"
        @retry="handleAdjustSetup"
      />

      <QuizAnswering
        v-else-if="stage === 'answering' && activeQuizData"
        :quiz-data="activeQuizData"
        @complete="handleComplete"
      />

      <QuizResults
        v-else-if="stage === 'results' && activeQuizData"
        :quiz-data="activeQuizData"
        :answers="completedAnswers"
        @retake="handleRetake"
        @new-quiz="handleNewQuiz"
        @adjust-setup="handleAdjustSetup"
      />
    </Transition>
  </div>
</template>
