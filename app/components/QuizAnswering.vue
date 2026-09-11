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
      <UButton color="neutral" variant="ghost" size="sm" class="shrink-0 gap-1.5 text-muted"
        @click="requestExit">
        <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
        Avsluta
      </UButton>
    </div>

    <div class="mb-8">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs text-muted">
          Fråga
          <span class="font-medium text-highlighted">{{
            currentIndex + 1
            }}</span>
          / {{ questionCount }}
        </span>
        <span class="text-xs text-muted">
          {{ answeredCount }}/{{ questionCount }} besvarade
        </span>
      </div>
      <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-[width] duration-200 ease-spring"
          :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <QuizQuestion v-if="currentQuestion" :key="currentQuestion.id" :question="currentQuestion"
      :selected-answer="answers[currentQuestion.id]" @answer="onAnswer" />

    <div class="sticky bottom-0 mt-8 border-t border-default/60 bg-default/80 py-4 backdrop-blur-sm">
      <div class="flex items-center justify-end gap-3">
        <span v-if="!hasAnsweredCurrent && !isLastQuestion" class="text-2xs text-muted/60">
          Svara för att fortsätta
        </span>
        <UFieldGroup>
          <UButton color="neutral" variant="outline" size="sm" :disabled="currentIndex === 0"
            class="gap-1.5 border-default" @click="emit('previous')">
            <UIcon name="i-lucide-arrow-left" class="h-3.5 w-3.5" />
            Förra
          </UButton>
          <UButton v-if="!isLastQuestion" color="neutral" variant="outline" size="sm" :disabled="!hasAnsweredCurrent"
            class="gap-1.5 border-default" @click="emit('next', hasAnsweredCurrent)">
            Nästa
            <UIcon name="i-lucide-arrow-right" class="h-3.5 w-3.5" />
          </UButton>
          <UButton v-else size="sm" :disabled="!canSubmit" class="gap-1.5" @click="submit">
            <UIcon name="i-lucide-circle-check" class="h-3.5 w-3.5" />
            Rätta quiz
          </UButton>
        </UFieldGroup>
      </div>
    </div>

    <UModal v-model:open="isExitDialogOpen" :dismissible="false" :close="false"
      title="Avsluta quizet?"
      :description="`Du har svarat på ${answeredCount} av ${questionCount} frågor. Dina svar försvinner.`">
      <template #footer="{ close }">
        <UButton color="neutral" variant="outline" @click="close()">
          Fortsätt quizet
        </UButton>
        <UButton @click="confirmExit">Avsluta</UButton>
      </template>
    </UModal>
  </div>
</template>
