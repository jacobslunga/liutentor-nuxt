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
// remembering it is what lets a resize re-apply the cap without stomping them.
let lastApplied = 0;
const EPSILON = 0.0005;

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

// Once capped the level is a number, and the plugin only re-resolves resizes
// for *mode* levels, so the cap would otherwise never be re-evaluated when the
// window crosses it. Skipped outright if the reader has since zoomed manually.
watch(
  viewport,
  (vp, _prev, onCleanup) => {
    if (!vp) return;
    const off = vp.onViewportResize(() => {
      if (isOurs()) apply();
    });
    if (typeof off === "function") onCleanup(off);
  },
  { immediate: true },
);
</script>

<template>
  <slot />
</template>
