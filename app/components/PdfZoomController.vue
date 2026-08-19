<script setup lang="ts">
import { useZoom, ZoomMode } from "@embedpdf/plugin-zoom/vue";
import { useViewportCapability } from "@embedpdf/plugin-viewport/vue";
import { useScrollCapability } from "@embedpdf/plugin-scroll/vue";
import { pdfResetZoomKey } from "@/lib/pdf-zoom";

const props = defineProps<{
  documentId: string;

  maxPageWidth: number | null;
}>();

const { provides: zoom } = useZoom(() => props.documentId);
const { provides: viewport } = useViewportCapability();
const { provides: scroll } = useScrollCapability();

let lastApplied = 0;
const EPSILON = 0.0005;

let lastWidth = 0;

function availableWidth(): number | null {
  const vp = viewport.value;
  if (!vp) return null;
  const width =
    vp.forDocument(props.documentId).getMetrics().clientWidth -
    2 * vp.getViewportGap();
  return width > 0 ? width : null;
}

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

    lastApplied = 0;
    scope.requestZoom(ZoomMode.FitWidth);
    return;
  }

  lastApplied = cap / content;

  scope.requestZoom(lastApplied, { vx: 0, vy: 0 });
}

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

provide(pdfResetZoomKey, () => {
  apply();
  nextTick(scrollToTop);
});

function isOurs(): boolean {
  const level = zoom.value?.getState().zoomLevel;
  if (typeof level !== "number") return true;
  return !!lastApplied && Math.abs(level - lastApplied) < EPSILON;
}

watch(
  () => props.documentId,
  () => {
    lastApplied = 0;
    lastWidth = 0;
  },
);

watch(
  [() => props.maxPageWidth, zoom, scroll, viewport],
  ([, , , vp], prev) => {
    if (!vp) return;
    apply();

    if (prev) nextTick(scrollToTop);
  },
  { immediate: true },
);

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

// EmbedPDF only refits mode-based zoom; numeric zoom must scale with the viewport.
watch(
  viewport,
  (vp, _prev, onCleanup) => {
    if (!vp) return;
    const off = vp.onViewportResize((event) => {
      if (event.documentId !== props.documentId) return;

      const width = availableWidth();
      if (!width) return;

      const previousWidth = lastWidth;

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
