<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  canStart: boolean;
}>();

const emit = defineEmits<{
  start: [];
}>();

const canClick = computed(() => props.canStart && !props.isLoading);
</script>

<template>
  <div class="w-full">
    <p class="text-sm text-muted-foreground leading-relaxed">
      Ett AI-genererat quiz baserat på ett slumpat urval tentor.
    </p>

    <p v-if="!canStart" class="mt-4 text-sm text-muted-foreground">
      Inga tentor hittades med PDF.
    </p>

    <Button class="mt-6 gap-1.5" :disabled="!canClick" @click="emit('start')">
      Generera quiz
    </Button>
  </div>
</template>
