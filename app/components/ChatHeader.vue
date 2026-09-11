<template>
  <div class="pointer-events-none relative isolate flex h-14 items-center justify-between gap-2 px-3">
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-20 bg-linear-to-b from-default to-transparent" />

    <div class="pointer-events-auto flex min-w-0 flex-1 items-center">
      <UTooltip text="Stäng chatten">
        <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-right" aria-label="Stäng chatten"
          @click="emit('close')" />
      </UTooltip>
    </div>

    <div class="pointer-events-auto flex shrink-0 items-center gap-1">
      <UTooltip text="Ny chatt">
        <UButton color="neutral" variant="ghost" icon="i-lucide-plus" aria-label="Ny chatt" @click="emit('newChat')" />
      </UTooltip>
      <UTooltip text="Historik">
        <UButton color="neutral" variant="ghost" icon="i-lucide-history" aria-label="Historik"
          @click="emit('openHistory')" />
      </UTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
}>();
</script>
