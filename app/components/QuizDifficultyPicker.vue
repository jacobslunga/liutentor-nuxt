<script setup lang="ts">
import type { QuizDifficulty } from "@/types/quiz";
import { QUIZ_DIFFICULTIES } from "@/types/quiz";
import { cn } from "@/lib/utils";

const props = defineProps<{
  modelValue: QuizDifficulty;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: QuizDifficulty];
}>();

const OPTIONS: Record<QuizDifficulty, { label: string; hint: string }> = {
  easy: {
    label: "Lätt",
    hint: "Centrala definitioner och grundbegrepp, en sak i taget.",
  },
  medium: {
    label: "Medel",
    hint: "Begrepp, tolkning och samband — kräver att du förstått, inte bara sett.",
  },
  hard: {
    label: "Svår",
    hint: "Antaganden, gränsfall och begrepp som lätt blandas ihop.",
  },
};

const activeHint = computed(() => OPTIONS[props.modelValue].hint);

function select(value: QuizDifficulty) {
  if (props.disabled || value === props.modelValue) return;
  emit("update:modelValue", value);
}

// Arrow keys move between options the way a native radio group does. Only the
// selected button is in the tab order, so Tab leaves the group instead of
// stepping through all three.
function onKeydown(event: KeyboardEvent) {
  const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
  const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
  if (!forward && !back) return;

  event.preventDefault();
  const current = QUIZ_DIFFICULTIES.indexOf(props.modelValue);
  const next =
    (current + (forward ? 1 : -1) + QUIZ_DIFFICULTIES.length) %
    QUIZ_DIFFICULTIES.length;
  select(QUIZ_DIFFICULTIES[next]!);
}
</script>

<template>
  <div class="w-full">
    <p class="text-xs font-medium text-muted-foreground">Svårighetsgrad</p>

    <div
      role="radiogroup"
      aria-label="Svårighetsgrad"
      class="mt-2 inline-flex rounded-full border border-border bg-background p-0.5"
      @keydown="onKeydown"
    >
      <button
        v-for="level in QUIZ_DIFFICULTIES"
        :key="level"
        type="button"
        role="radio"
        :aria-checked="modelValue === level"
        :tabindex="modelValue === level ? 0 : -1"
        :disabled="disabled"
        :class="
          cn(
            'cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-[color,background-color] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
            modelValue === level
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )
        "
        @click="select(level)"
      >
        {{ OPTIONS[level].label }}
      </button>
    </div>

    <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
      {{ activeHint }}
    </p>
  </div>
</template>
