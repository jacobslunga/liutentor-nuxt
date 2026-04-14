<script setup lang="ts">
import type { MultipleChoiceQuizResponse } from "@/types/quiz";

const props = defineProps<{
  quizData: MultipleChoiceQuizResponse;
}>();

const emit = defineEmits<{
  complete: [answers: Record<number, number>];
}>();

const currentIndex = ref(0);
const answers = ref<Record<number, number>>({});

const questions = computed(() => props.quizData.quiz.questions);
const questionCount = computed(() => questions.value.length);
const currentQuestion = computed(
  () => questions.value[currentIndex.value] ?? null,
);
const isLastQuestion = computed(
  () => currentIndex.value === questionCount.value - 1,
);
const hasAnsweredCurrent = computed(
  () =>
    currentQuestion.value !== null &&
    answers.value[currentQuestion.value.id] !== undefined,
);
const answeredCount = computed(
  () => questions.value.filter((q) => answers.value[q.id] !== undefined).length,
);
const canSubmit = computed(
  () => questionCount.value > 0 && answeredCount.value === questionCount.value,
);
const progress = computed(() =>
  Math.round(((currentIndex.value + 1) / questionCount.value) * 100),
);

function onAnswer(optionIndex: number) {
  if (!currentQuestion.value) return;
  answers.value[currentQuestion.value.id] = optionIndex;
}

function next() {
  if (!hasAnsweredCurrent.value) return;
  currentIndex.value = Math.min(
    currentIndex.value + 1,
    questionCount.value - 1,
  );
}

function previous() {
  currentIndex.value = Math.max(currentIndex.value - 1, 0);
}

function submit() {
  if (!canSubmit.value) return;
  emit("complete", { ...answers.value });
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-6">
    <div class="mb-5">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">
          Fråga
          <span class="font-medium text-foreground">{{
            currentIndex + 1
          }}</span>
          / {{ questionCount }}
        </span>
        <span class="text-xs text-muted-foreground">
          {{ answeredCount }}/{{ questionCount }} besvarade
        </span>
      </div>
      <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          class="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <QuizQuestion
      v-if="currentQuestion"
      :key="currentQuestion.id"
      :question="currentQuestion"
      :selected-answer="answers[currentQuestion.id]"
      @answer="onAnswer"
    />

    <div
      class="sticky bottom-0 mt-6 border-t border-border/40 bg-background/80 py-3 backdrop-blur-sm"
    >
      <div class="flex items-center justify-end gap-3">
        <span
          v-if="!hasAnsweredCurrent && !isLastQuestion"
          class="text-[11px] text-muted-foreground/60"
        >
          Svara för att fortsätta
        </span>
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentIndex === 0"
            class="gap-1.5 border-border/50 shadow-none"
            @click="previous"
          >
            <LucideArrowLeft class="h-3.5 w-3.5" />
            Förra
          </Button>
          <Button
            v-if="!isLastQuestion"
            variant="outline"
            size="sm"
            :disabled="!hasAnsweredCurrent"
            class="gap-1.5 border-border/50 shadow-none"
            @click="next"
          >
            Nästa
            <LucideArrowRight class="h-3.5 w-3.5" />
          </Button>
          <Button
            v-else
            size="sm"
            :disabled="!canSubmit"
            class="gap-1.5"
            @click="submit"
          >
            <LucideCheckCircle2 class="h-3.5 w-3.5" />
            Rätta quiz
          </Button>
        </ButtonGroup>
      </div>
    </div>
  </div>
</template>
