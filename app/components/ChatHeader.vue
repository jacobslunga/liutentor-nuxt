<template>
  <div
    class="pointer-events-none relative isolate flex h-12 items-start justify-between gap-2 overflow-visible px-3 pt-1"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 -z-10 bg-background/95 backdrop-blur-md mask-[linear-gradient(to_bottom,black_65%,transparent)]"
    />

    <div class="pointer-events-auto flex min-w-0 flex-1 items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        class="shrink-0"
        aria-label="Stäng chatten"
        @click="emit('close')"
      >
        <LucideChevronRight />
      </Button>
      <p class="min-w-0 truncate text-sm font-normal text-muted-foreground">
        {{ displayTitle }}
      </p>
    </div>
    <div class="pointer-events-auto flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ny chatt"
        @click="emit('newChat')"
      >
        <LucideMessageSquareShare class="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Historik"
        @click="emit('openHistory')"
      >
        <LucidePanelRight class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
}>();
const displayTitle = computed(() => props.title?.trim() || "Ny chatt");
const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
}>();
</script>
