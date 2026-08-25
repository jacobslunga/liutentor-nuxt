<script setup lang="ts">
import type { QuizDifficulty } from "@/types/quiz";
import { QUIZ_DIFFICULTIES } from "@/types/quiz";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// TabsRoot arbetar med string; svårighetsgraden är en sluten union, så värdet
// valideras mot listan i stället för att castas blint.
function onUpdate(value: string | number) {
  if (props.disabled) return;
  const next = QUIZ_DIFFICULTIES.find((level) => level === value);
  if (next && next !== props.modelValue) emit("update:modelValue", next);
}
</script>

<template>
  <div class="w-full">
    <p class="text-xs font-medium text-muted-foreground">Svårighetsgrad</p>

    <Tabs :model-value="modelValue" class="mt-2" @update:model-value="onUpdate">
      <TabsList aria-label="Svårighetsgrad" class="w-fit">
        <TabsTrigger
          v-for="level in QUIZ_DIFFICULTIES"
          :key="level"
          :value="level"
          :disabled="disabled"
          class="h-full px-4 text-xs font-medium"
        >
          {{ OPTIONS[level].label }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <p class="mt-2 text-xs leading-relaxed text-muted-foreground">
      {{ activeHint }}
    </p>
  </div>
</template>
