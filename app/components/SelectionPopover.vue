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
      <div v-if="visible" class="fixed z-100" :style="{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, calc(-100% - 8px))',
      }">
        <Button size="sm" variant="outline" @mousedown.prevent.stop="emit('reply')">
          Svara
          <LucideCornerUpLeft class="w-3.5 h-3.5" />
        </Button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-spring),
    transform var(--duration-fast) var(--ease-spring);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 4px));
}
</style>
