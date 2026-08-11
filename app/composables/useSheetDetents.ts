import { ref, computed, onMounted, onUnmounted } from "vue";

export type Detent = "peek" | "medium" | "full";

/**
 * Collapsed height, above the home indicator. Exported because the surface
 * behind the sheet has to reserve exactly this much room for it — see
 * MobilePdfView.
 */
export const PEEK_CONTENT_HEIGHT = 72;
const MEDIUM_RATIO = 0.45;

/** Detents low-to-high, so "one step in the fling direction" is just ±1. */
const DETENT_ORDER: Detent[] = ["peek", "medium", "full"];

/** How far past the release point a throw is projected, in ms of travel. */
const VELOCITY_PROJECTION_MS = 120;
/** px/ms above which a release reads as a fling rather than a drop. */
const FLING_VELOCITY = 0.4;

/** Resistance when pulling above the full detent. */
const RUBBER_BAND_EXPONENT = 0.72;

/** px of travel below which a gesture still counts as a tap. */
const TAP_SLOP = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Drag and snap physics for an iOS-style multi-detent bottom sheet.
 *
 * Position is expressed as an *offset*: how far the sheet is pushed down from
 * fully open. The sheet box itself is always full height and moves by
 * `translateY(offset)`, so dragging is a compositor-only transform and the
 * transcript inside it never relayouts mid-gesture.
 */
export function useSheetDetents() {
  const detent = ref<Detent>("peek");
  const isDragging = ref(false);
  /**
   * Whether the current (or most recent) gesture travelled far enough to be a
   * drag. Tappable surfaces inside the drag region check this to tell a tap
   * apart from the click that trails every drag.
   */
  const hasMoved = ref(false);

  // Non-null only while a finger is down. Everything else derives the offset
  // from the settled detent, so a viewport change (keyboard, rotation, browser
  // chrome collapsing) reflows the sheet for free.
  const dragOffset = ref<number | null>(null);

  const viewportHeight = ref(0);
  const safeAreaBottom = ref(0);

  const heights = computed(() => {
    const full = viewportHeight.value;
    return {
      peek: PEEK_CONTENT_HEIGHT + safeAreaBottom.value,
      medium: Math.round(full * MEDIUM_RATIO),
      full,
    };
  });

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

  // ─── Viewport ──────────────────────────────────────────────────
  // The *visual* viewport, not innerHeight: iOS shrinks only the former when
  // the keyboard opens, and the sheet has to end above it.

  function readViewport() {
    viewportHeight.value = window.visualViewport?.height ?? window.innerHeight;
  }

  /**
   * Measured off a throwaway element rather than read from a custom property —
   * whether `env()` resolves inside `getComputedStyle` varies by engine, and a
   * wrong answer here puts the peek bar under the home indicator.
   */
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

  // Measured during setup rather than only on mount. Starting from a zero
  // viewport makes `full` and `peek` collapse to the same offset, so the sheet
  // renders wide open for a frame and the correction then animates — it visibly
  // snaps shut on load.
  if (import.meta.client) {
    readViewport();
    if (document.body) readSafeArea();
  }

  /**
   * Gates the settle transition until after the first paint, so nothing the
   * initial measurement changes can animate.
   */
  const isReady = ref(false);

  // ─── Gesture ───────────────────────────────────────────────────

  let dragEl: HTMLElement | null = null;
  let activePointerId: number | null = null;
  let startY = 0;
  let startOffset = 0;
  let startDetent: Detent = "peek";
  let lastY = 0;
  let lastTime = 0;
  /** px per ms; positive is downward, i.e. collapsing. */
  let velocity = 0;

  function onPointerMove(e: PointerEvent) {
    if (e.pointerId !== activePointerId) return;

    const delta = e.clientY - startY;
    if (!hasMoved.value && Math.abs(delta) > TAP_SLOP) hasMoved.value = true;
    let next = startOffset + delta;

    if (next < 0) {
      // Pulled above full: resist rather than letting the sheet leave the top.
      next = -Math.pow(-next, RUBBER_BAND_EXPONENT);
    } else if (next > maxOffset.value) {
      // Hard stop at peek — the collapsed bar must never leave the screen.
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
      // A throw must always move at least one detent the way it pointed, even
      // if the finger barely travelled before letting go.
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

    // Opted-out controls inside the drag region keep their own gestures. Only
    // these are excluded, not every button: the collapsed bar is both the
    // primary drag surface and a tap target, and callers tell the two apart
    // with `hasMoved`.
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

  /**
   * What the sheet currently *looks* like. `detent` only updates on settle, so
   * header content driven off it would sit on the old variant for the whole
   * gesture and pop at the end.
   */
  const visualDetent = computed(() =>
    isDragging.value ? nearestDetent(offset.value) : detent.value,
  );

  return {
    detent,
    visualDetent,
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
