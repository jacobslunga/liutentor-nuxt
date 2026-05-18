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
    <div
      class="mb-10 text-2xl font-medium leading-snug text-foreground sm:text-3xl lg:text-4xl"
    >
      <QuizMarkdown
        :content="question.question"
        class="text-xl font-semibold"
      />
    </div>

    <div class="flex flex-col gap-3.5">
      <div
        v-for="(option, i) in question.options"
        :key="`${question.id}-${i}`"
        role="button"
        tabindex="0"
        class="group flex w-full items-center gap-4 rounded-lg border px-5 py-4 text-left text-base transition-all duration-150 cursor-pointer select-none sm:px-6 sm:py-5 sm:text-lg"
        :class="
          selectedAnswer === i
            ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
            : 'border-border/50 hover:border-border hover:bg-muted/30'
        "
        @click="emit('answer', i)"
        @keydown.enter.space.prevent="emit('answer', i)"
      >
        <span
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors"
          :class="
            selectedAnswer === i
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-muted-foreground/30 bg-background group-hover:border-muted-foreground/50'
          "
        >
          {{ String.fromCharCode(65 + i) }}
        </span>
        <div class="min-w-0 leading-relaxed">
          <QuizMarkdown
            :content="option"
            class="prose-p:text-inherit prose-p:leading-inherit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
