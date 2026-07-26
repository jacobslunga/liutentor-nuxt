<script setup lang="ts">
const svgRef = ref<SVGSVGElement | null>(null);

const eyeX = ref(0);
const eyeY = ref(0);
const blinking = ref(false);

// Ögonens maximala utslag, i viewBox-enheter.
const MAX_X = 8;
const MAX_Y = 6;

let pointerX = 0;
let pointerY = 0;
let hasPointer = false;
let rafId: number | null = null;
let blinkTimer: number | null = null;

function step() {
  const el = svgRef.value;
  if (!el) {
    rafId = null;
    return;
  }

  // Rect:en läses en gång per frame (inte per pointer-event) så utslaget följer
  // maskoten även när chatt-panelen dragits om — ResizeHandle utlöser aldrig
  // något window-resize.
  const rect = el.getBoundingClientRect();
  const dx = pointerX - (rect.left + rect.width / 2);
  const dy = pointerY - (rect.top + rect.height / 2);

  // Mjuk avtagning: nära markören ger litet utslag, långt bort närmar sig
  // blicken fullt utslag utan att någonsin slå i kanten.
  const denom = Math.hypot(dx, dy) + 120;
  const targetX = hasPointer ? (dx / denom) * MAX_X : 0;
  const targetY = hasPointer ? (dy / denom) * MAX_Y : 0;

  const diffX = targetX - eyeX.value;
  const diffY = targetY - eyeY.value;

  if (Math.abs(diffX) < 0.001 && Math.abs(diffY) < 0.001) {
    eyeX.value = targetX;
    eyeY.value = targetY;
    rafId = null;
    return;
  }

  eyeX.value += diffX * 0.18;
  eyeY.value += diffY * 0.18;
  rafId = requestAnimationFrame(step);
}

function ensureFrame() {
  if (rafId) return;
  rafId = requestAnimationFrame(step);
}

function handlePointerMove(e: PointerEvent) {
  pointerX = e.clientX;
  pointerY = e.clientY;
  hasPointer = true;
  ensureFrame();
}

function scheduleBlink() {
  blinkTimer = window.setTimeout(
    () => {
      blinking.value = true;
      blinkTimer = window.setTimeout(() => {
        blinking.value = false;
        scheduleBlink();
      }, 130);
    },
    4000 + Math.random() * 3000,
  );
}

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  scheduleBlink();
});

onUnmounted(() => {
  window.removeEventListener("pointermove", handlePointerMove);
  if (rafId) cancelAnimationFrame(rafId);
  if (blinkTimer) clearTimeout(blinkTimer);
});
</script>

<template>
  <svg ref="svgRef" class="mascot text-primary" :class="{ 'is-blinking': blinking }" viewBox="0 0 100 100"
    aria-hidden="true" focusable="false">
    <circle cx="50" cy="50" r="46" fill="currentColor" />
    <g :transform="`translate(${eyeX.toFixed(3)} ${eyeY.toFixed(3)})`">
      <rect class="eye" x="29.5" y="39" width="10" height="16" rx="1.5" />
      <rect class="eye" x="60.5" y="39" width="10" height="16" rx="1.5" />
    </g>
  </svg>
</template>

<style scoped>
.mascot {
  --mascot-eye: oklch(0.28 0.05 172);
}

.dark .mascot {
  --mascot-eye: oklch(0.26 0.04 145);
}

.eye {
  fill: var(--mascot-eye);
  transform-box: fill-box;
  transform-origin: center;
  transform: scaleY(1);
  transition: transform 130ms var(--ease-spring);
}

.is-blinking .eye {
  transform: scaleY(0.12);
}

@media (prefers-reduced-motion: reduce) {
  .eye {
    transition: none;
  }
}
</style>
