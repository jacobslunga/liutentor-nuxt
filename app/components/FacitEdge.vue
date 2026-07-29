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

// Every mix here is `in oklab`, not oklch. --border and --foreground are
// achromatic, so their hue is recorded as 0deg; oklch interpolates hue as an
// angle, which drags an 18% mix of a 172deg teal all the way down to ~31deg and
// renders the border orange. oklab is rectangular and blends through the true
// neutral axis instead.
const surface = (percent: number) =>
  `color-mix(in oklab, var(--foreground) ${percent.toFixed(2)}%, var(--background))`;

const sheetStyle = computed(() => {
  const v = spring.value;
  return {
    width: `${REST_WIDTH + v * (OPEN_WIDTH - REST_WIDTH)}px`,
    // A plain --background sheet would be invisible here: in exam-only mode the
    // margin beside the page is already --background. A few percent of
    // --foreground reads as a distinct surface in both themes without
    // introducing a colour of its own.
    backgroundColor: surface(3 + v * 3),
    borderLeftColor: `color-mix(in oklab, var(--primary) ${(18 + v * 52).toFixed(0)}%, var(--border))`,
    boxShadow: `-14px 0 30px -14px color-mix(in oklab, var(--foreground) ${(v * 22).toFixed(0)}%, transparent)`,
  };
});

// The permanent affordance. Without something visible at rest there is nothing
// telling you the right edge is worth approaching at all. It shares the sheet's
// fill, so as the sheet widens past it the nub stops reading as a separate
// object and simply becomes the sheet's edge.
const nubStyle = computed(() => {
  const v = spring.value;
  return {
    opacity: 1 - Math.min(v / 0.45, 1),
    backgroundColor: surface(5),
    borderColor: `color-mix(in oklab, var(--primary) 22%, var(--border))`,
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

    <div
      class="absolute right-0 top-1/2 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-l-lg border-y border-l"
      :style="nubStyle">
      <LucideChevronLeft class="size-4 text-muted-foreground" />
    </div>

    <div class="absolute right-0 top-1/2 flex items-center gap-2 whitespace-nowrap pr-4" :style="labelStyle">
      <template v-if="facitPdfUrl">
        <LucideArrowLeftToLine class="size-4 shrink-0 text-primary" />
        <span class="text-xs font-medium text-primary">{{ label ?? "Facit" }}</span>
      </template>
      <span v-else class="text-xs text-muted-foreground">Ej tillgängligt</span>
    </div>
  </div>
</template>
