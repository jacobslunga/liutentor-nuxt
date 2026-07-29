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
                :style="props.topInset ? { paddingTop: `${props.topInset}px` } : undefined"
                @scroll="handleViewportScroll"
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
</style>
