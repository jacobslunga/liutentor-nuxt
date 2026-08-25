<script setup lang="ts">
import type { Exam, QuizDifficulty } from "@/types/quiz";
import { DEFAULT_QUIZ_DIFFICULTY, QUIZ_DIFFICULTIES } from "@/types/quiz";
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

// Remembered across visits: a student who wants easy quizzes wants them every
// time, and re-picking on every generation is the kind of friction that makes
// them just take the default instead.
const DIFFICULTY_STORAGE_KEY = "liutentor.quiz.difficulty";
const difficulty = ref<QuizDifficulty>(DEFAULT_QUIZ_DIFFICULTY);

onMounted(() => {
  const stored = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
  if (stored && QUIZ_DIFFICULTIES.includes(stored as QuizDifficulty)) {
    difficulty.value = stored as QuizDifficulty;
  }
});

watch(difficulty, (value) => {
  localStorage.setItem(DIFFICULTY_STORAGE_KEY, value);
});

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
    difficulty: difficulty.value,
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
          v-model:difficulty="difficulty"
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
