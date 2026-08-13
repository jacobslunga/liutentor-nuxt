<script setup lang="ts">
import type { MultipleChoiceQuizResponse } from "@/types/quiz";

const props = defineProps<{
  quizData: MultipleChoiceQuizResponse;
  currentIndex: number;
  answers: Record<number, number>;
}>();

const emit = defineEmits<{
  answer: [questionId: number, optionIndex: number];
  complete: [];
  next: [hasAnsweredCurrent: boolean];
  previous: [];
  exit: [];
}>();

const isExitDialogOpen = ref(false);

const answers = computed(() => props.answers);
const questions = computed(() => props.quizData.quiz.questions);
const currentIndex = computed(() => props.currentIndex);

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
  emit("answer", currentQuestion.value.id, optionIndex);
}

function submit() {
  if (!canSubmit.value) return;
  emit("complete");
}

function requestExit() {
  if (answeredCount.value > 0) {
    isExitDialogOpen.value = true;
    return;
  }
  emit("exit");
}

function confirmExit() {
  isExitDialogOpen.value = false;
  emit("exit");
}
</script>

<template>
  <div class="w-full">
    <div class="mb-6 flex items-center justify-start gap-3">
      <Button
        variant="ghost"
        size="sm"
        class="shrink-0 gap-1.5 text-muted-foreground"
        @click="requestExit"
      >
        <LucideArrowLeft class="h-3.5 w-3.5" />
        Avsluta
      </Button>
    </div>

    <div class="mb-8">
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
          class="h-full rounded-full bg-primary transition-[width] duration-200 ease-spring"
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
      class="sticky bottom-0 mt-8 border-t border-border/60 bg-background/80 py-4 backdrop-blur-sm"
    >
      <div class="flex items-center justify-end gap-3">
        <span
          v-if="!hasAnsweredCurrent && !isLastQuestion"
          class="text-2xs text-muted-foreground/60"
        >
          Svara för att fortsätta
        </span>
        <ButtonGroup>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentIndex === 0"
            class="gap-1.5 border-border"
            @click="emit('previous')"
          >
            <LucideArrowLeft class="h-3.5 w-3.5" />
            Förra
          </Button>
          <Button
            v-if="!isLastQuestion"
            variant="outline"
            size="sm"
            :disabled="!hasAnsweredCurrent"
            class="gap-1.5 border-border"
            @click="emit('next', hasAnsweredCurrent)"
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
            <LucideCheckCircle class="h-3.5 w-3.5" />
            Rätta quiz
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <AlertDialog v-model:open="isExitDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Avsluta quizet?</AlertDialogTitle>
          <AlertDialogDescription>
            Du har svarat på {{ answeredCount }} av {{ questionCount }} frågor.
            Dina svar försvinner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Fortsätt quizet</AlertDialogCancel>
          <AlertDialogAction @click="confirmExit">Avsluta</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
