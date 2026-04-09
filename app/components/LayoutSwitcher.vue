<script setup lang="ts">
const { layoutMode, setLayoutMode } = useLayoutMode();

const isVisible = ref(true);
const isHovering = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function handleMouseMove() {
  isVisible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!isHovering.value) isVisible.value = false;
  }, 2000);
}

onMounted(() => {
  handleMouseMove();
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  if (hideTimer) clearTimeout(hideTimer);
});

const modes = [
  { value: "exam-with-facit" as const, label: "Tenta & Facit", icon: "split" },
  { value: "exam-only" as const, label: "Endast tenta", icon: "half" },
];
</script>

<template>
  <div
    class="fixed bottom-10 left-5 z-40 hidden md:flex rounded-lg p-1 transition-opacity duration-300"
    :class="
      isVisible || isHovering
        ? 'opacity-100 pointer-events-auto'
        : 'opacity-0 pointer-events-none'
    "
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="flex items-center gap-0">
      <TooltipProvider
        v-for="mode in modes"
        :key="mode.value"
        :delay-duration="0"
      >
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="flex border items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer"
              :class="[
                mode.value === 'exam-with-facit'
                  ? 'rounded-l-lg'
                  : 'rounded-r-lg',
                layoutMode === mode.value
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground',
              ]"
              @click="setLayoutMode(mode.value)"
            >
              <LucideColumns2 v-if="mode.icon === 'split'" class="w-5 h-5" />
              <LucidePanelRight v-else class="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ mode.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
