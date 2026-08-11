<script setup lang="ts">
import { createPluginRegistration } from "@embedpdf/core";
import { EmbedPDF } from "@embedpdf/core/vue";
import { usePdfiumEngine } from "@embedpdf/engines/vue";
import {
  DocumentManagerPluginPackage,
  DocumentContent,
} from "@embedpdf/plugin-document-manager/vue";
import { ViewportPluginPackage, Viewport } from "@embedpdf/plugin-viewport/vue";
import { ScrollPluginPackage, Scroller } from "@embedpdf/plugin-scroll/vue";
import { RenderPluginPackage, RenderLayer } from "@embedpdf/plugin-render/vue";
import {
  ZoomPluginPackage,
  ZoomMode,
  ZoomGestureWrapper,
} from "@embedpdf/plugin-zoom/vue";
import {
  InteractionManagerPluginPackage,
  PagePointerProvider,
} from "@embedpdf/plugin-interaction-manager/vue";
import {
  SelectionPluginPackage,
  SelectionLayer,
} from "@embedpdf/plugin-selection/vue";
import { RotatePluginPackage, Rotate } from "@embedpdf/plugin-rotate/vue";

const props = defineProps<{
  pdfUrl: string;
  layoutMode?: "exam-only" | "exam-with-facit" | "default";
  /**
   * Clearance for a bar that overlays the top of this viewer. Desktop only —
   * the mobile view insets the viewer's box instead, so nothing scrolls under
   * its header at all.
   */
  topInset?: number;
  /**
   * Offer "Förklara" over a text selection. Opt-in: only a page that actually
   * has somewhere to send the text (the chat panel) should ask for it.
   */
  explainEnabled?: boolean;
}>();

const emit = defineEmits<{ explain: [text: string] }>();

const colorMode = useColorMode();
const { engine, isLoading } = usePdfiumEngine();

const isDark = computed(() => colorMode.value === "dark");

const selectionColor = computed(() =>
  isDark.value
    ? "color-mix(in oklch, var(--primary) 35%, transparent)"
    : "color-mix(in oklch, var(--primary) 28%, transparent)",
);

// Dark mode: fully invert the page (hue-rotate keeps coloured content roughly
// true), which turns the white paper black. `screen` then leaves the backdrop
// untouched wherever the page is black, so the paper renders as exactly
// --background — no invert percentage to keep in sync with the token.
const darkPageStyle = {
  filter: "invert(1) hue-rotate(180deg)",
  mixBlendMode: "screen",
} as const;

// Resolved once, on purpose. The parent swaps between the mobile and desktop
// trees at the same 1024px breakpoint, so crossing it remounts this component
// anyway — and keeping these reactive meant every resize event rebuilt the
// plugin registry below, tearing the document down mid-drag.
const isMobile = window.innerWidth < 1024;
const windowWidth = window.innerWidth;

const viewportEl = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

const viewportInsetStyle = computed(() =>
  props.topInset ? { paddingTop: `${props.topInset}px` } : undefined,
);

// EmbedPDF treats every wheel event as a pixel-precise trackpad gesture
// (`1 - deltaY * 0.01`). A single mouse notch is normally reported as 100
// pixels (or 3 lines in Firefox), which that formula turns into a request to
// zoom out tenfold. Translate a notch into the small pixel delta its existing
// gesture handler expects, and leave everything else alone.
const WHEEL_PIXELS_PER_NOTCH = 100;
const WHEEL_LINES_PER_NOTCH = 3;
// Some mice report several notches in one event. Without a ceiling a flick of
// the wheel crosses the entire zoom range at once.
const MAX_NOTCHES_PER_EVENT = 3;
// A physical notch is a discrete step, so it lands in full on the frame it
// arrives — the reader gets a browser-sized zoom increment with no tail.
const ZOOM_PER_NOTCH = 0.105;
const normalizedWheelEvents = new WeakSet<WheelEvent>();

// A trackpad pinch arrives as many small, often fractional, pixel deltas —
// exactly what EmbedPDF's formula was written for, so it passes through
// untouched and stays as smooth as it already is. Reading the event rather
// than the platform also covers a Mac driving an ordinary mouse, which used to
// hit the tenfold jump, and a Windows precision touchpad, which never should.
const MOUSE_NOTCH_DELTA_THRESHOLD = 40;

function isMouseNotch(event: WheelEvent) {
  return (
    event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
    Math.abs(event.deltaY) >= MOUSE_NOTCH_DELTA_THRESHOLD
  );
}

function wheelNotches(event: WheelEvent) {
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return event.deltaY / WHEEL_LINES_PER_NOTCH;
    case WheelEvent.DOM_DELTA_PAGE:
      return event.deltaY;
    default:
      return event.deltaY / WHEEL_PIXELS_PER_NOTCH;
  }
}

function dispatchNormalizedWheel(
  viewport: HTMLElement,
  source: WheelEvent,
  notches: number,
) {
  // EmbedPDF derives a scale factor as `1 - deltaY * 0.01`. Convert our
  // stable exponential notch curve back into that expected delta format.
  const zoomFactor = Math.exp(-ZOOM_PER_NOTCH * notches);
  const normalizedDeltaY = (1 - zoomFactor) / 0.01;
  const normalizedEvent = new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: source.clientX,
    clientY: source.clientY,
    ctrlKey: source.ctrlKey,
    metaKey: source.metaKey,
    deltaMode: WheelEvent.DOM_DELTA_PIXEL,
    deltaX: 0,
    deltaY: normalizedDeltaY,
  });
  normalizedWheelEvents.add(normalizedEvent);
  viewport.dispatchEvent(normalizedEvent);
}

function handleWheelCapture(event: WheelEvent) {
  // The replacement event below is intentionally allowed through to EmbedPDF.
  // It retains the library's transient transform, pointer anchoring, and
  // 150 ms gesture batching instead of duplicating that sensitive logic here.
  if (normalizedWheelEvents.has(event)) return;
  if (!event.ctrlKey && !event.metaKey) return;
  if (!isMouseNotch(event)) return;

  const notches = Math.max(
    -MAX_NOTCHES_PER_EVENT,
    Math.min(MAX_NOTCHES_PER_EVENT, wheelNotches(event)),
  );
  if (!notches) return;
  const viewport = event.currentTarget as HTMLElement | null;
  if (!viewport) return;

  // EmbedPDF listens on this same element, so stopping the original here is
  // what keeps the raw notch out of its handler.
  event.preventDefault();
  event.stopImmediatePropagation();
  dispatchNormalizedWheel(viewport, event, notches);
}

function handleViewportScroll(event: Event) {
  const target = event.currentTarget as HTMLElement;
  viewportEl.value = target;
  showScrollTop.value = target.scrollTop > 320;
}

// Reading the exam full-bleed on a wide monitor gives an unreadably long line,
// but the old ZoomMode.Automatic capped at 100% of the PDF's own scale, which
// on a 1700px window left the page occupying about a third of the width. In
// exam-only mode the page fills the viewport up to this cap instead.
const MAX_EXAM_ONLY_PAGE_WIDTH = 980;

// null means "always fill the pane" — in split view the pane is already narrow
// enough to be the constraint.
const maxPageWidth = computed(() =>
  props.layoutMode === "exam-only" ? MAX_EXAM_ONLY_PAGE_WIDTH : null,
);

// Only the starting point; PdfZoomController owns it from the first resolve on,
// which is what lets the zoom follow a layout toggle without a plugin rebuild.
const defaultZoomLevel = ZoomMode.FitWidth;

// Depends on `pdfUrl` and nothing else: navigating to another exam reuses this
// instance, so the registry genuinely has to be rebuilt for a new document.
// Anything else in here — the old reactive windowWidth, or layoutMode once the
// layout switcher stopped remounting this component — silently triggers a full
// re-registration and a document reload.
const plugins = computed(() => {
  const base = [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments: [{ url: props.pdfUrl }],
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage),
    createPluginRegistration(RenderPluginPackage),
    createPluginRegistration(RotatePluginPackage),
    createPluginRegistration(ZoomPluginPackage, { defaultZoomLevel }),
  ];

  if (isMobile) {
    return base;
  }

  return [
    ...base,
    createPluginRegistration(InteractionManagerPluginPackage),
    createPluginRegistration(SelectionPluginPackage, {
      toleranceFactor: 2.0,
      minSelectionDragDistance: 5,
    }),
  ];
});
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-background">
    <div
      v-if="isLoading || !engine"
      class="flex h-full w-full items-center justify-center"
    >
      <LucideLoader2 class="h-5 w-5 animate-spin text-muted-foreground" />
    </div>

    <EmbedPDF v-else :engine="engine" :plugins="plugins">
      <template #default="{ activeDocumentId }">
        <template v-if="activeDocumentId">
          <PdfZoomController :document-id="activeDocumentId" :max-page-width="maxPageWidth" />

          <!-- EmbedPDF renders a fragment, so this positions against the root
               above — whose top edge already sits below the mobile header. -->
          <PdfZoomControls v-if="isMobile" :document-id="activeDocumentId" class="absolute right-0 top-3 z-20" />

          <DocumentContent :document-id="activeDocumentId">
            <template #default="{ isLoaded }">
              <div
                v-if="!isLoaded"
                class="flex h-full w-full items-center justify-center"
              >
                <LucideLoader2
                  class="h-5 w-5 animate-spin text-muted-foreground"
                />
              </div>

              <Viewport
                v-else
                :document-id="activeDocumentId"
                class="h-full w-full bg-background pdf-viewport"
                :style="viewportInsetStyle"
                @scroll="handleViewportScroll"
                @wheel.capture="handleWheelCapture"
              >
                <template v-if="isMobile">
                  <Scroller :document-id="activeDocumentId">
                    <template #default="{ page }">
                      <div
                        :style="{
                          width: `${page.width}px`,
                          height: `${page.height}px`,
                        }"
                        class="relative mx-auto my-4 pdf-page-shell"
                      >
                        <Rotate
                          :document-id="activeDocumentId"
                          :page-index="page.pageIndex"
                          class="relative h-full w-full dark:bg-background"
                        >
                          <div
                            class="absolute inset-0 z-0 pdf-render-surface"
                            :style="isDark ? darkPageStyle : {}"
                          >
                            <RenderLayer
                              :document-id="activeDocumentId"
                              :page-index="page.pageIndex"
                            />
                          </div>
                        </Rotate>
                      </div>
                    </template>
                  </Scroller>
                </template>

                <template v-else>
                  <PdfInner>
                    <ZoomGestureWrapper
                      :document-id="activeDocumentId"
                      :enable-pinch="false"
                      :enable-wheel="true"
                      class="pdf-zoom-gesture"
                    >
                      <Scroller :document-id="activeDocumentId">
                        <template #default="{ page }">
                          <div
                            :style="{
                              width: `${page.width}px`,
                              height: `${page.height}px`,
                            }"
                            class="relative mx-auto my-4 pdf-page-shell"
                          >
                            <PagePointerProvider
                              :document-id="activeDocumentId"
                              :page-index="page.pageIndex"
                            >
                              <Rotate
                                :document-id="activeDocumentId"
                                :page-index="page.pageIndex"
                                class="relative h-full w-full dark:bg-background"
                              >
                                <div
                                  class="absolute inset-0 z-0 pdf-render-surface"
                                  :style="isDark ? darkPageStyle : {}"
                                >
                                  <RenderLayer
                                    :document-id="activeDocumentId"
                                    :page-index="page.pageIndex"
                                  />
                                </div>
                                <div
                                  class="absolute inset-0 z-10 pdf-selection-surface"
                                >
                                  <SelectionLayer
                                    :document-id="activeDocumentId"
                                    :page-index="page.pageIndex"
                                    :text-style="{ background: selectionColor }"
                                  >
                                    <!-- The wrapper is a pointer-events: none
                                         box over the selection's bounding rect,
                                         counter-rotated and zoom-scaled by the
                                         plugin, so the button only has to say
                                         which side of it to sit on. -->
                                    <template
                                      v-if="props.explainEnabled"
                                      #selection-menu="{ menuWrapperProps, placement }"
                                    >
                                      <div v-bind="menuWrapperProps">
                                        <PdfSelectionMenu
                                          :document-id="activeDocumentId"
                                          :above="placement.suggestTop"
                                          @explain="emit('explain', $event)"
                                        />
                                      </div>
                                    </template>
                                  </SelectionLayer>
                                </div>
                              </Rotate>
                            </PagePointerProvider>
                          </div>
                        </template>
                      </Scroller>
                    </ZoomGestureWrapper>
                  </PdfInner>
                </template>
              </Viewport>
            </template>
          </DocumentContent>
        </template>
      </template>
    </EmbedPDF>
  </div>
</template>

<style scoped>
.pdf-viewport {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.pdf-viewport::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* EmbedPDF previews a zoom gesture by transforming this element, then clears
   the transform when it commits. Deliberately no transition: the browser would
   animate that reset while the pages re-render at the new scale, which reads as
   a wobble. */
.pdf-zoom-gesture {
  will-change: transform;
}
</style>
