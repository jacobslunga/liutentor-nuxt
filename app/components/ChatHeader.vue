<template>
  <div
    class="shrink-0 relative flex items-center justify-between px-3 py-2 z-90 overflow-visible"
  >
    <div class="flex items-center gap-2 min-w-0">
      <Button variant="ghost" size="icon" class="size-8" @click="emit('close')">
        <LucideChevronRight />
      </Button>
    </div>
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="emit('newChat')"
      >
        <LucidePlus class="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        @click="emit('openHistory')"
      >
        <LucidePanelRightDashed v-if="historyOpen" class="w-4 h-4" />
        <LucidePanelRight v-else class="w-4 h-4" />
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
