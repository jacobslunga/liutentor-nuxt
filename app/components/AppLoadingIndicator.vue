<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
    errorColor?: string;
    height?: number;
    /** How long the curve takes to approach (but never reach) 100%. */
    duration?: number;
    /** Ignore bursts of work shorter than this, so fast pages never flash. */
    throttle?: number;
    /**
     * How long to wait for more work before declaring the page done. Loading is
     * chained rather than parallel — data resolves, then a lazy component mounts,
     * then it starts fetching — so the count dips to zero in between. Without
     * this the bar would complete in that lull and a second bar would start.
     */
    settleDelay?: number;
    hideDelay?: number;
  }>(),
  {
    color: "var(--primary)",
    errorColor: "var(--destructive)",
    height: 2,
    duration: 2000,
    throttle: 80,
    settleDelay: 250,
    hideDelay: 150,
  },
);

const { isLoading, failed } = usePageLoading();

/** Keep in sync with the opacity transition in the style block below. */
const FADE_MS = 300;

const progress = ref(0);
const visible = ref(false);

let rafId = 0;
let startTime = 0;
let throttleTimer: ReturnType<typeof setTimeout> | undefined;
let settleTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers() {
  clearTimeout(throttleTimer);
  clearTimeout(settleTimer);
  clearTimeout(hideTimer);
  clearTimeout(resetTimer);
  throttleTimer = undefined;
  settleTimer = undefined;
  hideTimer = undefined;
  resetTimer = undefined;
}

function stopAnimation() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

/**
 * Nuxt's easing: asymptotic, so the bar keeps creeping toward 100% without ever
 * arriving until the work actually finishes.
 */
function estimate(elapsed: number) {
  const completion = (elapsed / props.duration) * 100;
  return (2 / Math.PI) * 100 * Math.atan(completion / 50);
}

function step(now: number) {
  if (!startTime) startTime = now;
  progress.value = Math.max(0, Math.min(100, estimate(now - startTime)));
  rafId = requestAnimationFrame(step);
}

function start() {
  // Work arriving during the settle window rejoins the batch already running:
  // cancel the pending finish and leave the clock alone.
  if (settleTimer) {
    clearTimeout(settleTimer);
    settleTimer = undefined;
    return;
  }
  if (rafId || throttleTimer) return;

  clearTimers();
  // One continuous clock for the whole batch. Restarting it whenever another
  // task joins is what would make the bar jump backwards mid-page.
  startTime = 0;
  progress.value = 0;
  throttleTimer = setTimeout(() => {
    visible.value = true;
    rafId = requestAnimationFrame(step);
  }, props.throttle);
}

function settle() {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(finish, props.settleDelay);
}

function finish() {
  clearTimers();
  stopAnimation();
  if (!visible.value) {
    // Never became visible (finished inside the throttle window) — stay quiet.
    progress.value = 0;
    return;
  }
  progress.value = 100;
  hideTimer = setTimeout(() => {
    visible.value = false;
    // Width stays at 100% until the fade has finished. Zeroing it together with
    // the opacity would animate the bar visibly shrinking back on its way out.
    resetTimer = setTimeout(() => {
      progress.value = 0;
    }, FADE_MS);
  }, props.hideDelay);
}

watch(isLoading, (loading) => (loading ? start() : settle()));

onBeforeUnmount(() => {
  clearTimers();
  stopAnimation();
});
</script>

<template>
  <div
    class="app-loading-indicator"
    :style="{
      height: `${height}px`,
      width: `${progress}%`,
      opacity: visible ? 1 : 0,
      background: failed ? errorColor : color,
    }"
  />
</template>

<style scoped>
.app-loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: auto;
  bottom: auto;
  z-index: 999999;
  pointer-events: none;
  transform: translateZ(0);
  transition:
    width 0.1s linear,
    opacity 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .app-loading-indicator {
    transition: opacity 0.3s ease;
  }
}
</style>
