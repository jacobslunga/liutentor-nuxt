<script setup lang="ts">
import type { QuizQuestion } from "@/types/quiz";

const props = defineProps<{
  question: QuizQuestion;
  selectedAnswer: number | undefined;
}>();

const emit = defineEmits<{
  answer: [optionIndex: number];
}>();
</script>

<template>
  <div>
    <div class="mb-6 text-base leading-relaxed sm:text-lg">
      <QuizMarkdown :content="question.question" />
    </div>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="(option, i) in question.options"
        :key="`${question.id}-${i}`"
        role="button"
        tabindex="0"
        class="group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-150 cursor-pointer select-none"
        :class="
          selectedAnswer === i
            ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
            : 'border-border/50 hover:border-border hover:bg-muted/30'
        "
        @click="emit('answer', i)"
        @keydown.enter.space.prevent="emit('answer', i)"
      >
        <span
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors"
          :class="
            selectedAnswer === i
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 bg-background group-hover:border-muted-foreground/50'
          "
        >
          {{ String.fromCharCode(65 + i) }}
        </span>
        <div class="min-w-0 leading-relaxed">
          <QuizMarkdown :content="option" />
        </div>
      </div>
    </div>
  </div>
</template>
