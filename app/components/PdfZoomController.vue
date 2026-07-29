<script setup lang="ts">
import { useZoom, ZoomMode } from "@embedpdf/plugin-zoom/vue";
import { useViewportCapability } from "@embedpdf/plugin-viewport/vue";
import { useScrollCapability } from "@embedpdf/plugin-scroll/vue";

/**
 * Renderless — must live inside <EmbedPDF>, since the capabilities it uses
 * come from the plugin registry.
 *
 * `defaultZoomLevel` is applied once at registration, so it cannot answer a
 * layout change on a viewer that (deliberately) survives one. This keeps the
 * zoom in step with the layout instead.
 */
const props = defineProps<{
  documentId: string;
  /**
   * Widest the page may render, in CSS px. Below this the page simply fills
   * the viewport; above it the page is capped, so a full-width window does not
   * produce an unreadably long measure. `null` means "always fill".
   */
  maxPageWidth: number | null;
}>();

const { provides: zoom } = useZoom(() => props.documentId);
const { provides: viewport } = useViewportCapability();
const { provides: scroll } = useScrollCapability();

// The zoom we last asked for. The capped zoom is a plain number,
// indistinguishable from one the reader chose by scrolling or pinching, so
// remembering it is what tells the two apart on a resize.
let lastApplied = 0;
const EPSILON = 0.0005;

// Width the current zoom was computed against, so a resize can scale a manual
// zoom by how much the viewport actually changed.
let lastWidth = 0;

function availableWidth(): number | null {
  const vp = viewport.value;
  if (!vp) return null;
  const width =
    vp.forDocument(props.documentId).getMetrics().clientWidth -
    2 * vp.getViewportGap();
  return width > 0 ? width : null;
}

/**
 * The widest spread, unscaled — the same quantity the zoom plugin divides by
 * when it resolves a fit mode. Read straight from the layout rather than
 * inferred from a resolved zoom: before the first resolve the reported zoom is
 * still the initial 1, and dividing by that yields a page "width" equal to the
 * viewport, which then caps to a wildly zoomed-out page.
 */
function contentWidth(): number | null {
  const sc = scroll.value;
  if (!sc) return null;

  const spreads = sc.forDocument(props.documentId).getSpreadPagesWithRotatedSize();
  if (!spreads?.length) return null;

  const pageGap = sc.getPageGap();
  let widest = 0;
  for (const spread of spreads) {
    const width = spread.reduce(
      (total, page, i) => total + page.rotatedSize.width + (i ? pageGap : 0),
      0,
    );
    widest = Math.max(widest, width);
  }
  return widest > 0 ? widest : null;
}

function apply() {
  const scope = zoom.value;
  if (!scope) return;

  const available = availableWidth();
  if (!available) return;

  lastWidth = available;

  const cap = props.maxPageWidth;
  if (cap === null || available <= cap) {
    lastApplied = 0;
    scope.requestZoom(ZoomMode.FitWidth);
    return;
  }

  const content = contentWidth();
  if (!content) {
    // Layout not ready yet; onLayoutReady below runs this again.
    lastApplied = 0;
    scope.requestZoom(ZoomMode.FitWidth);
    return;
  }

  lastApplied = cap / content;
  // Anchor on the viewport's top-left. requestZoom otherwise preserves the
  // centre point, which silently scrolls you down the page as it zooms in.
  scope.requestZoom(lastApplied, { vx: 0, vy: 0 });
}

/**
 * A manual zoom is a fixed number, so the plugin leaves it alone on resize and
 * the page keeps its absolute size while the pane around it changes — the one
 * case where the document stops tracking the layout. Scaling it by the change
 * in viewport width preserves the proportion the reader chose, taking their
 * current zoom as the reference rather than snapping back to a fit.
 */
function rescaleManualZoom(previousWidth: number, nextWidth: number) {
  const scope = zoom.value;
  if (!scope || !previousWidth || !nextWidth) return;

  const current = scope.getState().currentZoomLevel;
  if (!current) return;

  scope.requestZoom(current * (nextWidth / previousWidth), { vx: 0, vy: 0 });
}

function scrollToTop() {
  viewport.value?.forDocument(props.documentId).scrollTo({ x: 0, y: 0 });
}

function isOurs(): boolean {
  const level = zoom.value?.getState().zoomLevel;
  if (typeof level !== "number") return true;
  return !!lastApplied && Math.abs(level - lastApplied) < EPSILON;
}

// A different document means different page dimensions.
watch(
  () => props.documentId,
  () => {
    lastApplied = 0;
    lastWidth = 0;
  },
);

// Re-fit when the cap changes (layout toggled) and once the capabilities exist.
// Both entering and leaving exam-only mode restart the reader at the top.
watch(
  [() => props.maxPageWidth, zoom, scroll, viewport],
  ([, , , vp], prev) => {
    if (!vp) return;
    apply();
    // Not on the very first run: that one only establishes the initial zoom,
    // and the load-time scroll reset is handled by onLayoutReady below.
    if (prev) nextTick(scrollToTop);
  },
  { immediate: true },
);

// The layout is what tells us the real page size, and it lands asynchronously
// after the document parses. This is the pass that gets the initial zoom right.
watch(
  scroll,
  (sc, _prev, onCleanup) => {
    if (!sc) return;
    const off = sc.onLayoutReady((event) => {
      if (event.documentId !== props.documentId) return;
      apply();
      nextTick(scrollToTop);
    });
    if (typeof off === "function") onCleanup(off);
  },
  { immediate: true },
);

// The plugin only re-resolves a resize for *mode* levels, so anything we or the
// reader pinned to a number stops tracking the pane without this: our own value
// needs the cap re-evaluated, theirs needs scaling by the same proportion.
watch(
  viewport,
  (vp, _prev, onCleanup) => {
    if (!vp) return;
    const off = vp.onViewportResize((event) => {
      if (event.documentId !== props.documentId) return;

      const width = availableWidth();
      if (!width) return;

      const previousWidth = lastWidth;
      // Sub-pixel churn only, e.g. a scrollbar appearing because we just
      // rezoomed. Acting on it would feed back into itself.
      if (Math.abs(width - previousWidth) < 1) return;
      lastWidth = width;

      if (isOurs()) apply();
      else rescaleManualZoom(previousWidth, width);
    });
    if (typeof off === "function") onCleanup(off);
  },
  { immediate: true },
);
</script>

<template>
  <slot />
</template>
