<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import type { QuizDifficulty } from "@/types/quiz";
import { QUIZ_DIFFICULTIES } from "@/types/quiz";

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

const items = computed<TabsItem[]>(() =>
  QUIZ_DIFFICULTIES.map((level) => ({
    value: level,
    label: OPTIONS[level].label,
    disabled: props.disabled,
  })),
);

// Flikarna arbetar med string; svårighetsgraden är en sluten union, så värdet
// valideras mot listan i stället för att castas blint.
function onUpdate(value: string | number) {
  if (props.disabled) return;
  const next = QUIZ_DIFFICULTIES.find((level) => level === value);
  if (next && next !== props.modelValue) emit("update:modelValue", next);
}
</script>

<template>
  <div class="w-[80%] flex flex-col items-center justify-center">
    <p class="text-xs font-medium text-muted">Svårighetsgrad</p>

    <UTabs color="neutral" :model-value="modelValue" :items="items" :content="false" class="mt-2 w-full"
      aria-label="Svårighetsgrad" @update:model-value="onUpdate" />

    <p class="mt-2 text-xs leading-relaxed text-muted">
      {{ activeHint }}
    </p>
  </div>
</template>
