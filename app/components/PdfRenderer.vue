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

  topInset?: number;

  explainEnabled?: boolean;
}>();

const emit = defineEmits<{ explain: [text: string] }>();

const colorMode = useColorMode();
const { engine, isLoading } = usePdfiumEngine();

const selectionColor = "color-mix(in oklch, var(--primary) 10%, transparent)";

const darkPageStyle = {
  filter: "invert(1) hue-rotate(180deg)",
  mixBlendMode: "screen",
} as const;

const dimPageStyle = {
  filter: "invert(1) hue-rotate(180deg) brightness(0.92)",
  mixBlendMode: "screen",
} as const;

const lightPageStyle = {
  // PDF pages render with an opaque white canvas. Multiplying it over the app
  // background makes that white resolve to the exact --background token.
  mixBlendMode: "multiply",
} as const;

const pageStyle = computed(() => {
  if (colorMode.value === "dark") return darkPageStyle;
  if (colorMode.value === "dim") return dimPageStyle;
  return lightPageStyle;
});

// Keep this non-reactive: rebuilding the plugin registry during resize reloads the PDF.
const isMobile = window.innerWidth < 1024;

const viewportEl = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

const viewportInsetStyle = computed(() =>
  props.topInset ? { paddingTop: `${props.topInset}px` } : undefined,
);

// EmbedPDF interprets mouse-wheel notches as trackpad deltas, causing extreme zoom jumps.
const WHEEL_PIXELS_PER_NOTCH = 100;
const WHEEL_LINES_PER_NOTCH = 3;

const MAX_NOTCHES_PER_EVENT = 3;

const ZOOM_PER_NOTCH = 0.105;
const normalizedWheelEvents = new WeakSet<WheelEvent>();

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

  event.preventDefault();
  event.stopImmediatePropagation();
  dispatchNormalizedWheel(viewport, event, notches);
}

function handleViewportScroll(event: Event) {
  const target = event.currentTarget as HTMLElement;
  viewportEl.value = target;
  showScrollTop.value = target.scrollTop > 320;
}

const MAX_EXAM_ONLY_PAGE_WIDTH = 980;

const maxPageWidth = computed(() =>
  props.layoutMode === "exam-only" ? MAX_EXAM_ONLY_PAGE_WIDTH : null,
);

const defaultZoomLevel = ZoomMode.FitWidth;

// Only a new PDF URL may invalidate this registry; other dependencies reload the document.
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
    createPluginRegistration(InteractionManagerPluginPackage),
    createPluginRegistration(SelectionPluginPackage, {
      toleranceFactor: 2.0,
      minSelectionDragDistance: 5,
    }),
  ];

  return base;
});
</script>

<template>
  <div class="group/pdf relative h-full w-full overflow-hidden bg-background">
    <div
      v-if="isLoading || !engine"
      class="flex h-full w-full items-center justify-center"
    >
      <LucideLoader2 class="h-5 w-5 animate-spin text-muted-foreground" />
    </div>

    <EmbedPDF v-else :engine="engine" :plugins="plugins">
      <template #default="{ activeDocumentId }">
        <template v-if="activeDocumentId">
          <PdfZoomController
            :document-id="activeDocumentId"
            :max-page-width="maxPageWidth"
          >
            <PdfPageControls
              v-if="!isMobile"
              :document-id="activeDocumentId"
              class="absolute bottom-4 left-1/2 z-30 -translate-x-1/2"
            />
          </PdfZoomController>

          <PdfZoomControls
            v-if="isMobile"
            :document-id="activeDocumentId"
            class="absolute right-0 top-3 z-20"
          />

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
                          width: `${page.rotatedWidth}px`,
                          height: `${page.rotatedHeight}px`,
                        }"
                        class="relative mx-auto my-4 pdf-page-shell"
                      >
                        <PagePointerProvider
                          :document-id="activeDocumentId"
                          :page-index="page.pageIndex"
                          class="pdf-mobile-pointer"
                        >
                          <Rotate
                            :document-id="activeDocumentId"
                            :page-index="page.pageIndex"
                            class="bg-background"
                            :style="{
                              width: `${page.width}px`,
                              height: `${page.height}px`,
                            }"
                          >
                            <div
                              class="absolute inset-0 z-0 pdf-render-surface"
                              :style="pageStyle"
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
                                <template
                                  v-if="props.explainEnabled"
                                  #selection-menu="{
                                    menuWrapperProps,
                                    placement,
                                  }"
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
                              width: `${page.rotatedWidth}px`,
                              height: `${page.rotatedHeight}px`,
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
                                class="bg-background"
                                :style="{
                                  width: `${page.width}px`,
                                  height: `${page.height}px`,
                                }"
                              >
                                <div
                                  class="absolute inset-0 z-0 pdf-render-surface"
                                  :style="pageStyle"
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
                                    <template
                                      v-if="props.explainEnabled"
                                      #selection-menu="{
                                        menuWrapperProps,
                                        placement,
                                      }"
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

.pdf-zoom-gesture {
  will-change: transform;
}

/* EmbedPDF defaults pointer surfaces to touch-action: none. Keep vertical page
   scrolling on touch devices while allowing horizontal drags to select text. */
:deep(.pdf-mobile-pointer) {
  touch-action: pan-y pinch-zoom !important;
}
</style>
