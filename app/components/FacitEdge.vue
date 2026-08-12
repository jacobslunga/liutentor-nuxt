<script setup lang="ts">
const props = defineProps<{
  facitPdfUrl: string | null;
  label?: string;
  intensity: number;
}>();

const spring = ref(0);
let targetValue = 0;
let rafId: number | null = null;

function animateTo(target: number) {
  targetValue = target;
  if (rafId) return;
  function step() {
    const diff = targetValue - spring.value;
    if (Math.abs(diff) < 0.001) {
      spring.value = targetValue;
      rafId = null;
      return;
    }
    spring.value += diff * 0.18;
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

const glowStyle = computed(() => {
  const v = spring.value;
  const mix = (percent: number) =>
    `color-mix(in oklab, var(--primary) ${percent.toFixed(1)}%, transparent)`;

  return {
    width: `${150 + v * 90}px`,
    opacity: 0.48 + v * 0.52,
    transform: `translateY(-50%) scaleY(${(0.82 + v * 0.18).toFixed(3)})`,
    backgroundImage: `radial-gradient(ellipse at 100% 50%, ${mix(20 + v * 32)} 0%, ${mix(12 + v * 22)} 22%, ${mix(4 + v * 12)} 48%, transparent 74%)`,
  };
});

const tabStyle = computed(() => {
  const v = spring.value;
  return {
    opacity: 0.68 + v * 0.32,
    transform: `translate(${(10 - v * 27).toFixed(1)}px, -50%)`,
    backgroundColor: `color-mix(in oklab, var(--background) ${(88 - v * 8).toFixed(0)}%, var(--primary))`,
    borderColor: `color-mix(in oklab, var(--primary) ${(28 + v * 42).toFixed(0)}%, var(--border))`,
    boxShadow: `-10px 0 28px -14px color-mix(in oklab, var(--primary) ${(18 + v * 42).toFixed(0)}%, transparent)`,
  };
});

const iconStyle = computed(() => {
  const v = spring.value;
  return {
    transform: `translateX(${(-v * 3).toFixed(1)}px)`,
  };
});

watch(() => props.intensity, animateTo, { immediate: true });

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    class="pointer-events-none absolute inset-y-0 right-0 w-64 overflow-hidden"
  >
    <div
      class="absolute right-0 top-1/2 h-[min(34rem,62vh)] origin-right will-change-[width,transform,opacity]"
      :style="glowStyle"
    />

    <div
      class="absolute right-0 top-1/2 flex h-10 items-center gap-2 whitespace-nowrap rounded-l-full border border-r-0 py-2 pl-3 pr-4 backdrop-blur-sm will-change-[transform,opacity]"
      :style="tabStyle"
    >
      <template v-if="facitPdfUrl">
        <LucideChevronLeft
          class="size-4 shrink-0 text-primary will-change-transform"
          :style="iconStyle"
        />
        <span class="text-xs font-semibold text-primary">
          {{ label ?? "Facit" }}
        </span>
      </template>
      <span v-else class="text-xs text-muted-foreground">Ej tillgängligt</span>
    </div>
  </div>
</template>
