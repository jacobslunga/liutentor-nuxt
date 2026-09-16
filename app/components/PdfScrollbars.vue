<script setup lang="ts">
import type { Ref } from "vue";

const viewport = inject<Ref<HTMLElement | null>>("viewport-element");
const track = ref<HTMLElement | null>(null);
const scrollLeft = ref(0);
const scrollWidth = ref(0);
const clientWidth = ref(0);
const trackWidth = ref(0);
const maximum = computed(() =>
  Math.max(0, scrollWidth.value - clientWidth.value),
);
const thumbWidth = computed(() =>
  Math.min(
    trackWidth.value,
    Math.max(
      40,
      (trackWidth.value * clientWidth.value) / (scrollWidth.value || 1),
    ),
  ),
);
const travel = computed(() => trackWidth.value - thumbWidth.value);
const thumbLeft = computed(() =>
  maximum.value ? (scrollLeft.value / maximum.value) * travel.value : 0,
);
let drag: { pointerId: number; x: number; scroll: number } | null = null;

function update() {
  const el = viewport?.value;
  if (!el) return;
  scrollLeft.value = el.scrollLeft;
  scrollWidth.value = el.scrollWidth;
  clientWidth.value = el.clientWidth;
  trackWidth.value = track.value?.clientWidth ?? 0;
}

watch(
  () => viewport?.value,
  (el, _, onCleanup) => {
    if (!el) return;
    const resize = new ResizeObserver(update);
    const observeContent = () => {
      resize.disconnect();
      resize.observe(el);
      for (const child of el.children) {
        if (child !== track.value) resize.observe(child);
      }
      update();
    };
    const mutations = new MutationObserver(observeContent);
    mutations.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    el.addEventListener("scroll", update, { passive: true });
    observeContent();
    onCleanup(() => {
      resize.disconnect();
      mutations.disconnect();
      el.removeEventListener("scroll", update);
    });
  },
  { immediate: true, flush: "post" },
);

watch(track, (el, _, onCleanup) => {
  if (!el) return;
  const resize = new ResizeObserver(update);
  resize.observe(el);
  update();
  onCleanup(() => resize.disconnect());
});

function startDrag(event: PointerEvent) {
  if (event.button !== 0 || !track.value || !viewport?.value) return;
  event.preventDefault();
  if (event.target === track.value) {
    const x = event.clientX - track.value.getBoundingClientRect().left;
    viewport.value.scrollLeft =
      Math.max(
        0,
        Math.min(1, (x - thumbWidth.value / 2) / (travel.value || 1)),
      ) * maximum.value;
  }
  drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    scroll: viewport.value.scrollLeft,
  };
  track.value.setPointerCapture(event.pointerId);
}

function moveDrag(event: PointerEvent) {
  if (!drag || drag.pointerId !== event.pointerId || !viewport?.value) return;
  viewport.value.scrollLeft =
    drag.scroll +
    ((event.clientX - drag.x) / (travel.value || 1)) * maximum.value;
}

function handleKey(event: KeyboardEvent) {
  const el = viewport?.value;
  if (!el) return;
  const positions: Record<string, number> = {
    ArrowLeft: el.scrollLeft - 80,
    ArrowRight: el.scrollLeft + 80,
    Home: 0,
    End: maximum.value,
    PageUp: el.scrollLeft - el.clientWidth,
    PageDown: el.scrollLeft + el.clientWidth,
  };
  const position = positions[event.key];
  if (position === undefined) return;
  event.preventDefault();
  el.scrollLeft = position;
}
</script>

<template>
  <div
    v-if="maximum > 1"
    ref="track"
    role="scrollbar"
    tabindex="0"
    aria-label="Rulla PDF i sidled"
    aria-orientation="horizontal"
    :aria-valuemin="0"
    :aria-valuemax="Math.round(maximum)"
    :aria-valuenow="Math.round(scrollLeft)"
    class="absolute inset-x-4 bottom-[env(safe-area-inset-bottom,0px)] z-40 h-4 rounded-full border border-default bg-elevated shadow-sm touch-none select-none focus-visible:outline-2 focus-visible:outline-primary"
    @pointerdown="startDrag"
    @pointermove="moveDrag"
    @pointerup="drag = null"
    @pointercancel="drag = null"
    @lostpointercapture="drag = null"
    @keydown="handleKey"
  >
    <div
      class="absolute inset-y-0.5 rounded-full bg-muted hover:bg-primary cursor-grab active:cursor-grabbing"
      :style="{
        width: `${thumbWidth}px`,
        left: `${thumbLeft}px`,
        backgroundColor: 'var(--ui-text-muted)',
      }"
    />
  </div>
</template>
