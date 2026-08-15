<template>
  <div
    class="shrink-0 relative flex items-center justify-between gap-2 px-3 py-1 z-90 overflow-visible bg-background"
  >
    <div class="flex items-center gap-1.5 min-w-0 flex-1">
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
    <div class="flex items-center gap-1 shrink-0">
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
