<script setup lang="ts">
/**
 * The affordance for the facit panel, on the right edge of the exam reader.
 *
 * At rest it is a hairline — the edge of a sheet tucked just off-screen. As the
 * pointer approaches, that sheet slides out and the label surfaces on it. The
 * gesture is the same one that actually opens the facit, so the indicator is a
 * preview of the motion rather than a separate piece of decoration.
 */
const props = defineProps<{
  facitPdfUrl: string | null;
  label?: string;
  /**
   * Pointer proximity, 0..1, supplied by the parent. Deriving it there keeps a
   * second window-level mousemove listener off the page.
   */
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

const REST_WIDTH = 3;
const OPEN_WIDTH = 84;

const sheetStyle = computed(() => {
  const v = spring.value;
  return {
    width: `${REST_WIDTH + v * (OPEN_WIDTH - REST_WIDTH)}px`,
    // A plain --background sheet would be invisible here: in exam-only mode the
    // margin beside the page is already --background. A few percent of
    // --foreground reads as a distinct surface in both themes without
    // introducing a colour of its own.
    backgroundColor: `color-mix(in oklch, var(--foreground) ${(3 + v * 3).toFixed(2)}%, var(--background))`,
    borderLeftColor: `color-mix(in oklch, var(--primary) ${(18 + v * 52).toFixed(0)}%, var(--border))`,
    boxShadow: `-14px 0 30px -14px color-mix(in oklch, var(--foreground) ${(v * 22).toFixed(0)}%, transparent)`,
  };
});

// Held back until the sheet is wide enough to seat it, so the text never
// appears to spill past the edge it belongs to.
const labelStyle = computed(() => {
  const revealed = Math.min(Math.max((spring.value - 0.28) / 0.42, 0), 1);
  return {
    opacity: revealed,
    transform: `translate(${((1 - revealed) * 10).toFixed(1)}px, -50%)`,
  };
});

watch(() => props.intensity, animateTo, { immediate: true });

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="pointer-events-none absolute inset-y-0 right-0 w-32">
    <div class="absolute inset-y-0 right-0 border-l" :style="sheetStyle" />

    <div class="absolute right-0 top-1/2 flex items-center gap-2 whitespace-nowrap pr-4" :style="labelStyle">
      <template v-if="facitPdfUrl">
        <LucideArrowLeftToLine class="size-4 shrink-0 text-primary" />
        <span class="text-xs font-medium text-primary">{{ label ?? "Facit" }}</span>
      </template>
      <span v-else class="text-xs text-muted-foreground">Ej tillgängligt</span>
    </div>
  </div>
</template>
