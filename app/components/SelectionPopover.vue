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
        <Button size="sm" class="bg-foreground text-background hover:opacity-90 hover:bg-foreground/90"
          @mousedown.prevent.stop="emit('reply')">
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
    opacity 0.15s var(--ease-spring),
    transform 0.15s var(--ease-spring);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 4px));
}
</style>
