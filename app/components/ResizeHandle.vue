<script setup lang="ts">
const props = defineProps<{
  isResizing?: boolean;
}>();

const emit = defineEmits<{
  startResize: [];
}>();
</script>

<template>
  <div
    class="absolute top-0 bottom-0 left-0 z-[100] flex w-5 -translate-x-1/2 cursor-col-resize touch-none select-none items-center justify-center outline-none group"
    @mousedown.prevent="emit('startResize')">
    <div class="absolute inset-y-0 w-0.5 transition-colors duration-200"
      :class="isResizing ? 'bg-primary' : 'bg-border group-hover:bg-primary/50'" />
    <div
      class="relative flex h-8 w-4 items-center justify-center rounded-md border shadow-sm transition-all duration-200 bg-background"
      :class="isResizing
        ? 'border-primary scale-110'
        : 'border-border group-hover:border-primary/50'
        ">
      <LucideGripVertical class="h-4 w-4 transition-colors"
        :class="isResizing ? 'text-primary' : 'text-muted-foreground'" />
    </div>
  </div>
</template>
