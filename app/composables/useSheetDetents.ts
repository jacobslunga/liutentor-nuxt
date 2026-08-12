import { ref, computed, onMounted, onUnmounted } from "vue";

export type Detent = "peek" | "full";

export const PEEK_CONTENT_HEIGHT = 72;

const DETENT_ORDER: Detent[] = ["peek", "full"];

const VELOCITY_PROJECTION_MS = 120;

const FLING_VELOCITY = 0.4;

const RUBBER_BAND_EXPONENT = 0.72;

const TAP_SLOP = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useSheetDetents() {
  const detent = ref<Detent>("peek");
  const isDragging = ref(false);

  const hasMoved = ref(false);

  const dragOffset = ref<number | null>(null);

  const viewportHeight = ref(0);
  const safeAreaBottom = ref(0);

  const heights = computed(() => ({
    peek: PEEK_CONTENT_HEIGHT + safeAreaBottom.value,
    full: viewportHeight.value,
  }));

  function offsetFor(value: Detent) {
    return Math.max(heights.value.full - heights.value[value], 0);
  }

  const maxOffset = computed(() => offsetFor("peek"));
  const restOffset = computed(() => offsetFor(detent.value));
  const offset = computed(() => dragOffset.value ?? restOffset.value);

  function nearestDetent(position: number): Detent {
    let best: Detent = DETENT_ORDER[0]!;
    let bestDistance = Infinity;
    for (const candidate of DETENT_ORDER) {
      const distance = Math.abs(offsetFor(candidate) - position);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    return best;
  }

  function snapTo(value: Detent) {
    dragOffset.value = null;
    isDragging.value = false;
    detent.value = value;
  }

  function readViewport() {
    viewportHeight.value = window.visualViewport?.height ?? window.innerHeight;
  }

  function readSafeArea() {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;bottom:0;left:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-bottom, 0px)";
    document.body.appendChild(probe);
    safeAreaBottom.value = probe.getBoundingClientRect().height;
    probe.remove();
  }

  function handleViewportChange() {
    readViewport();
    readSafeArea();
  }

  if (import.meta.client) {
    readViewport();
    if (document.body) readSafeArea();
  }

  const isReady = ref(false);

  let dragEl: HTMLElement | null = null;
  let activePointerId: number | null = null;
  let startY = 0;
  let startOffset = 0;
  let startDetent: Detent = "peek";
  let lastY = 0;
  let lastTime = 0;

  let velocity = 0;

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId) return;

    const delta = e.clientY - startY;
    if (!hasMoved.value && Math.abs(delta) > TAP_SLOP) hasMoved.value = true;
    let next = startOffset + delta;

    if (next < 0) {

      next = -Math.pow(-next, RUBBER_BAND_EXPONENT);
    } else if (next > maxOffset.value) {

      next = maxOffset.value;
    }

    dragOffset.value = next;

    const elapsed = e.timeStamp - lastTime;
    if (elapsed > 0) {
      velocity = (e.clientY - lastY) / elapsed;
      lastY = e.clientY;
      lastTime = e.timeStamp;
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerId !== activePointerId) return;
    detachPointer();

    const current = dragOffset.value ?? restOffset.value;
    let target = nearestDetent(current + velocity * VELOCITY_PROJECTION_MS);

    if (Math.abs(velocity) > FLING_VELOCITY) {

      const direction = velocity > 0 ? -1 : 1;
      const floorIndex = clamp(
        DETENT_ORDER.indexOf(startDetent) + direction,
        0,
        DETENT_ORDER.length - 1,
      );
      const targetIndex = DETENT_ORDER.indexOf(target);
      target =
        direction > 0
          ? DETENT_ORDER[Math.max(targetIndex, floorIndex)]!
          : DETENT_ORDER[Math.min(targetIndex, floorIndex)]!;
    }

    snapTo(target);
  }

  function detachPointer() {
    if (dragEl && activePointerId !== null) {
      dragEl.removeEventListener("pointermove", onPointerMove);
      dragEl.removeEventListener("pointerup", onPointerUp);
      dragEl.removeEventListener("pointercancel", onPointerUp);
      if (dragEl.hasPointerCapture?.(activePointerId)) {
        dragEl.releasePointerCapture(activePointerId);
      }
    }
    dragEl = null;
    activePointerId = null;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-no-drag]")) return;

    detachPointer();

    dragEl = e.currentTarget as HTMLElement;
    activePointerId = e.pointerId;
    dragEl.setPointerCapture(e.pointerId);

    isDragging.value = true;
    hasMoved.value = false;
    startY = e.clientY;
    startOffset = restOffset.value;
    startDetent = detent.value;
    dragOffset.value = startOffset;
    lastY = e.clientY;
    lastTime = e.timeStamp;
    velocity = 0;

    dragEl.addEventListener("pointermove", onPointerMove);
    dragEl.addEventListener("pointerup", onPointerUp);
    dragEl.addEventListener("pointercancel", onPointerUp);
  }

  onMounted(() => {
    handleViewportChange();
    requestAnimationFrame(() => {
      isReady.value = true;
    });
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", readViewport);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
  });

  onUnmounted(() => {
    detachPointer();
    window.visualViewport?.removeEventListener("resize", handleViewportChange);
    window.visualViewport?.removeEventListener("scroll", readViewport);
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("orientationchange", handleViewportChange);
  });

  return {
    detent,
    offset,
    restOffset,
    isDragging,
    isReady,
    hasMoved,
    heights,
    maxOffset,
    safeAreaBottom,
    viewportHeight,
    snapTo,
    onPointerDown,
  };
}
