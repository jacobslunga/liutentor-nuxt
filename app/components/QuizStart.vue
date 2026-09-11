<script setup lang="ts">
import type { QuizDifficulty } from "@/types/quiz";

const props = defineProps<{
  isLoading: boolean;
  canStart: boolean;
  difficulty: QuizDifficulty;
}>();

const emit = defineEmits<{
  start: [];
  "update:difficulty": [value: QuizDifficulty];
}>();

const canClick = computed(() => props.canStart && !props.isLoading);
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center">
    <p class="text-sm text-muted leading-relaxed">
      Ett AI-genererat quiz baserat på ett slumpat urval tentor.
    </p>

    <p v-if="!canStart" class="mt-4 text-sm text-muted">
      Inga tentor hittades med PDF.
    </p>

    <QuizDifficultyPicker v-else class="mt-6" :model-value="difficulty" :disabled="isLoading"
      @update:model-value="emit('update:difficulty', $event)" />

    <UButton class="mt-6 gap-1.5" size="xl" :disabled="!canClick" @click="emit('start')">
      Generera quiz
    </UButton>
  </div>
</template>
