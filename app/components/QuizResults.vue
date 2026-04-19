<script setup lang="ts">
import type { MultipleChoiceQuizResponse } from "@/types/quiz";

const props = defineProps<{
  quizData: MultipleChoiceQuizResponse;
  answers: Record<number, number>;
}>();

const emit = defineEmits<{
  retake: [];
  newQuiz: [];
  adjustSetup: [];
}>();

const questions = computed(() => props.quizData.quiz.questions);
const quizMeta = computed(() => props.quizData?.meta ?? ({} as any));

const score = computed(() =>
  questions.value.reduce((acc, q) => {
    return props.answers[q.id] === q.answer ? acc + 1 : acc;
  }, 0),
);

const pct = computed(() =>
  questions.value.length > 0
    ? Math.round((score.value / questions.value.length) * 100)
    : 0,
);

const sourceCountLabel = computed(() => {
  const sourceCount =
    quizMeta.value?.sourceCount ?? quizMeta.value?.source_count ?? null;
  return typeof sourceCount === "number" ? `${sourceCount} tentor` : "Tentor";
});

const courseCodeLabel = computed(() => {
  const value = quizMeta.value?.courseCode ?? quizMeta.value?.course_code;
  return typeof value === "string" && value.length > 0 ? value : "Okänd kurs";
});
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-8">
    <div class="mb-6 flex items-end justify-between">
      <div>
        <p class="mb-1 text-[10px] font-medium text-muted-foreground/60">
          Resultat
        </p>
        <p class="text-4xl font-medium leading-none">
          {{ score }}
          <span class="text-2xl text-muted-foreground font-normal">
            / {{ questions.length }}</span
          >
        </p>
        <p class="mt-1.5 text-xs text-muted-foreground">
          {{ sourceCountLabel }} ·
          {{ courseCodeLabel }}
        </p>
      </div>
      <span class="text-3xl font-medium text-muted-foreground">{{ pct }}%</span>
    </div>

    <div class="mb-8 rounded-xl border border-dashed border-border/60 p-4">
      <p class="text-sm font-medium mb-0.5">Nästa?</p>
      <p class="text-xs text-muted-foreground mb-4">
        Gör om quizet eller skapa ett nytt med nya tentor.
      </p>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          class="gap-1.5 border-border/50 shadow-none"
          @click="emit('retake')"
        >
          <LucideRefreshCw class="h-3.5 w-3.5" />
          Gör om
        </Button>
        <Button size="sm" class="gap-1.5 ml-auto" @click="emit('newQuiz')">
          <LucideZap class="h-3.5 w-3.5" />
          Nytt quiz
        </Button>
      </div>
    </div>

    <p class="mb-3 text-[10px] font-medium text-muted-foreground/60">
      Genomgång
    </p>

    <div class="flex flex-col gap-3">
      <div
        v-for="(question, qi) in questions"
        :key="question.id"
        class="rounded-xl border border-border/50 p-4"
      >
        <div class="mb-3 flex items-center gap-2">
          <span
            class="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px]"
          >
            Fråga {{ qi + 1 }}
          </span>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
            :class="
              answers[question.id] === question.answer
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
                : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300'
            "
          >
            {{ answers[question.id] === question.answer ? "Rätt" : "Fel" }}
          </span>
        </div>

        <div class="mb-3 text-sm leading-relaxed">
          <QuizMarkdown :content="question.question" />
        </div>

        <div class="flex flex-col gap-1.5">
          <div
            v-for="(option, oi) in question.options"
            :key="`${question.id}-${oi}`"
            class="rounded-lg border px-3 py-2 text-xs"
            :class="[
              oi === question.answer
                ? 'border-emerald-500/40 bg-emerald-500/8 font-medium'
                : '',
              oi === answers[question.id] && oi !== question.answer
                ? 'border-rose-500/40 bg-rose-500/8'
                : '',
              oi !== question.answer && oi !== answers[question.id]
                ? 'border-transparent bg-muted/30'
                : '',
            ]"
          >
            <QuizMarkdown :content="option" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
