<script setup lang="ts">
defineProps<{
  isResizing?: boolean;
}>();

const emit = defineEmits<{
  startResize: [];
}>();
</script>

<template>
  <div
    class="absolute top-0 bottom-0 left-0 z-100 flex w-5 -translate-x-1/2 cursor-col-resize touch-none select-none items-center justify-center outline-none group"
    @mousedown.prevent="emit('startResize')">
    <div class="w-[5px] rounded-r-full transition-all duration-200 ease-spring" :class="isResizing
      ? 'h-16 bg-primary'
      : 'h-12 bg-ring group-hover:h-16 group-hover:bg-primary'
      " />
  </div>
</template>
