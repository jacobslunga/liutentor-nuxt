<script setup lang="ts">
defineProps<{
  x: number;
  y: number;
  visible: boolean;
}>();

const emit = defineEmits<{ reply: [] }>();
</script>

<template>
  <Teleport to="body">
    <Transition name="popover-fade">
      <div
        v-if="visible"
        class="fixed z-100"
        :style="{
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, calc(-100% - 8px))',
        }"
      >
        <button
          class="flex cursor-pointer items-center gap-1.5 bg-foreground text-background text-[13px] font-medium px-3 py-1.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all select-none"
          @mousedown.prevent.stop="emit('reply')"
        >
          Svara
          <LucideCornerUpLeft class="w-3.5 h-3.5" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 4px));
}
</style>
