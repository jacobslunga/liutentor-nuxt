<template>
  <div
    class="shrink-0 relative flex items-center justify-between px-3 py-2 z-90 overflow-visible"
  >
    <div
      class="absolute inset-x-0 top-0 -z-10 pointer-events-none liquid-glass-bg"
    />

    <div class="flex items-center gap-2 min-w-0">
      <Button variant="ghost" size="icon" class="size-8" @click="emit('close')">
        <LucideChevronRight />
      </Button>
    </div>
    <p
      class="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-normal truncate w-[42%] sm:w-[50%] text-center"
    >
      {{ displayTitle }}
    </p>
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

<style scoped>
.liquid-glass-bg {
  height: calc(100% + 1.5rem);

  backdrop-filter: blur(2px) saturate(180%) brightness(1.05);
  -webkit-backdrop-filter: blur(2px) saturate(180%) brightness(1.05);

  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--background) 75%, transparent) 0%,
    color-mix(in srgb, var(--background) 45%, transparent) 55%,
    transparent 100%
  );

  -webkit-mask-image: linear-gradient(
    to bottom,
    black 0%,
    black 50%,
    transparent 100%
  );
  mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);

  border-top: 0.5px solid color-mix(in srgb, white 30%, transparent);

  &::after {
    content: "";
    position: absolute;
    top: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, white 55%, transparent) 30%,
      color-mix(in srgb, white 55%, transparent) 70%,
      transparent
    );
  }
}
</style>
