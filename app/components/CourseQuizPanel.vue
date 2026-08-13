<script setup lang="ts">
import type { Exam } from "@/types/quiz";
import { toast } from "vue-sonner";
import { useQuizStore } from "@/stores/quiz";
import { useQuizHistory } from "@/composables/useQuizHistory";

const props = defineProps<{
  courseCode: string;
  exams: Exam[];
}>();

const MAX_SOURCE_EXAMS = 5;

const courseCode = computed(() => props.courseCode.toUpperCase());

const quiz = useQuizStore();
const user = useSupabaseUser();
const historyEnabled = computed(() =>
  Boolean((user.value as any)?.id ?? (user.value as any)?.sub),
);

const { courseHistory, findById, refresh, remove } = useQuizHistory(courseCode);

const examPool = computed(() => props.exams.filter((e) => e.pdf_url));
const canStart = computed(() => examPool.value.length > 0);

function startQuiz() {
  const pool = examPool.value;
  if (pool.length === 0) return;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count = Math.min(
    pool.length <= 2 ? pool.length : Math.floor(Math.random() * 3) + 2,
    MAX_SOURCE_EXAMS,
  );

  quiz.generate(courseCode.value, {
    examIds: shuffled.slice(0, count).map((e) => e.id),
  });
}

function loadFromHistory(id: string) {
  const item = findById(id);
  if (item) quiz.loadFromHistory(item);
}

async function deleteFromHistory(id: string) {
  if (quiz.activeQuizId === id) quiz.reset();

  const ok = await remove(id);
  if (ok) toast.success("Quizet raderades", { position: "top-center" });
  else
    toast.error("Kunde inte radera quizet", {
      position: "top-center",
    });
}

watch(courseCode, () => quiz.reset());

watch(
  () => quiz.stage,
  async (stage, prev) => {
    if (stage === "answering" && prev === "generating" && historyEnabled.value) {
      await refresh();
      const latest = courseHistory.value[0];
      if (latest) quiz.activeQuizId = latest.id;
    }
  },
);

onUnmounted(() => quiz.abort());
</script>

<template>
  <div class="w-full">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div v-if="quiz.stage === 'setup'">
        <QuizStart
          :is-loading="quiz.isGenerating"
          :can-start="canStart"
          @start="startQuiz"
        />

        <QuizHistoryList
          :history="courseHistory"
          :history-enabled="historyEnabled"
          :active-quiz-id="quiz.activeQuizId"
          @load-history="loadFromHistory"
          @delete-history="deleteFromHistory"
        />
      </div>

      <QuizGenerating
        v-else-if="quiz.stage === 'generating'"
        :status-message="quiz.generationStatus?.message ?? 'Förbereder quiz...'"
        :status-step="quiz.generationStatus?.step ?? null"
        :error="quiz.generationError"
        @retry="quiz.reset()"
        @cancel="quiz.reset()"
      />

      <QuizAnswering
        v-else-if="quiz.stage === 'answering' && quiz.quizData"
        :key="quiz.sessionKey"
        :quiz-data="quiz.quizData"
        :current-index="quiz.currentIndex"
        :answers="quiz.answers"
        @answer="quiz.setAnswer"
        @next="quiz.next"
        @previous="quiz.previous"
        @complete="quiz.complete"
        @exit="quiz.reset()"
      />

      <QuizResults
        v-else-if="quiz.stage === 'results' && quiz.quizData"
        :quiz-data="quiz.quizData"
        :answers="quiz.answers"
        @retake="quiz.retake()"
        @new-quiz="quiz.reset()"
      />
    </Transition>
  </div>
</template>
