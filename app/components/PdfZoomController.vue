<script setup lang="ts">
import { useZoom, ZoomMode } from "@embedpdf/plugin-zoom/vue";
import { useViewportCapability } from "@embedpdf/plugin-viewport/vue";

/**
 * Renderless — must live inside <EmbedPDF>, since the zoom and viewport
 * capabilities come from the plugin registry.
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

const { state, provides: zoom } = useZoom(() => props.documentId);
const { provides: viewport } = useViewportCapability();

// Unscaled page width. Derived the first time a fit mode resolves — after that
// any target width maps straight to a zoom factor, so a layout change is a
// single request with no intermediate frame at the wrong size.
let pageWidth = 0;

// The capped zoom is a plain number, indistinguishable from one the reader
// chose by scrolling or pinching. Remembering what we asked for is what lets a
// resize re-apply the cap without stomping on a manual zoom.
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

/** A fit mode has resolved, so currentZoomLevel reveals the page's real width. */
function learnPageWidth() {
  if (pageWidth) return;
  const available = availableWidth();
  const resolved = state.value.currentZoomLevel;
  if (!available || !resolved) return;
  pageWidth = available / resolved;
}

function isOurs(): boolean {
  const level = state.value.zoomLevel;
  if (typeof level !== "number") return true;
  return !!lastApplied && Math.abs(level - lastApplied) < EPSILON;
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

  learnPageWidth();
  if (!pageWidth) {
    // Page width unknown: fit first. Resolving it feeds the watcher below,
    // which re-runs this with enough information to cap it.
    lastApplied = 0;
    scope.requestZoom(ZoomMode.FitWidth);
    return;
  }

  lastApplied = cap / pageWidth;
  scope.requestZoom(lastApplied);
}

// A different document means a different page size.
watch(
  () => props.documentId,
  () => {
    pageWidth = 0;
    lastApplied = 0;
  },
);

// Re-fit when the cap changes (layout toggled) and once the zoom scope exists.
watch([() => props.maxPageWidth, zoom], apply, { immediate: true });

// Fit modes resolve asynchronously — on document load, and again on resize.
// Each resolve is a chance to learn the page width and clamp what it produced.
watch(
  () => state.value.currentZoomLevel,
  () => {
    if (state.value.zoomLevel !== ZoomMode.FitWidth) return;
    learnPageWidth();
    const available = availableWidth();
    const cap = props.maxPageWidth;
    if (!available || cap === null || available <= cap || !pageWidth) return;
    lastApplied = cap / pageWidth;
    zoom.value?.requestZoom(lastApplied);
  },
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
