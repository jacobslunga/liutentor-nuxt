<script setup lang="ts">
import type { Exam } from "@/types/quiz";
import { useQuizStore } from "@/stores/quiz";
import { useQuizHistory } from "@/composables/useQuizHistory";
import QuizHistorySidebar from "@/components/QuizHistorySidebar.vue";

definePageMeta({ layout: "default" });

const route = useRoute();
const courseCode = computed(() =>
  (route.params.courseCode as string).toUpperCase(),
);

useSeoMeta({
  title: () => `${courseCode.value} Quiz | Tentor`,
  description: "Träna på ett AI-genererat quiz med tidigare tentor.",
});

const quiz = useQuizStore();
const user = useSupabaseUser();
const historyEnabled = computed(() =>
  Boolean((user.value as any)?.id ?? (user.value as any)?.sub),
);

const { courseHistory, findById, refresh } = useQuizHistory(courseCode);

const { data: examsData, status: examsStatus } = useFetch<{
  data: { exams: Exam[] };
}>(`/api/exams/${courseCode.value}`, { key: `exams-${courseCode.value}` });

const exams = computed(
  () => (examsData.value as any)?.data?.exams ?? examsData.value ?? [],
);
const examsLoading = computed(() => examsStatus.value === "pending");

watch(courseCode, () => quiz.reset());

watch(
  () => quiz.stage,
  async (stage, prev) => {
    if (
      stage === "answering" &&
      prev === "generating" &&
      historyEnabled.value
    ) {
      await refresh();
      const latest = courseHistory.value[0];
      if (latest) quiz.activeQuizId = latest.id;
    }
  },
);

onUnmounted(() => quiz.abort());
</script>

<template>
  <div class="min-h-screen bg-background">
    <QuizNavBar
      :course-code="courseCode"
      :stage="quiz.stage"
      @new-quiz="quiz.reset()"
    />

    <div
      class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 pt-10 pb-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8 lg:pt-12"
    >
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-150"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <QuizSetup
          v-if="quiz.stage === 'setup'"
          :exams="exams"
          :exams-loading="examsLoading"
          :is-loading="quiz.isGenerating"
          @generate="(p) => quiz.generate(courseCode, p)"
        />

        <QuizGenerating
          v-else-if="quiz.stage === 'generating'"
          :status-message="
            quiz.generationStatus?.message ?? 'Förbereder quiz...'
          "
          :status-step="quiz.generationStatus?.step ?? null"
          :error="quiz.generationError"
          @retry="quiz.reset()"
        />

        <QuizAnswering
          v-else-if="quiz.stage === 'answering' && quiz.quizData"
          :key="quiz.sessionKey"
          :quiz-data="quiz.quizData"
          :current-index="quiz.currentIndex"
          @next="quiz.next"
          @previous="quiz.previous"
          @complete="quiz.complete"
        />

        <QuizResults
          v-else-if="quiz.stage === 'results' && quiz.quizData"
          :quiz-data="quiz.quizData"
          :answers="quiz.answers"
          @retake="quiz.retake()"
          @new-quiz="quiz.reset()"
          @adjust-setup="quiz.reset()"
        />
      </Transition>

      <QuizHistorySidebar
        :history="courseHistory"
        :history-enabled="historyEnabled"
        :active-quiz-id="quiz.activeQuizId"
        @load-history="
          (id) => {
            const item = findById(id);
            if (item) quiz.loadFromHistory(item);
          }
        "
      />
    </div>
  </div>
</template>
