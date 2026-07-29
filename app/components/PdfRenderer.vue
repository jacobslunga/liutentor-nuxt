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
}>();

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

// Depends on `pdfUrl` and nothing else: navigating to another exam reuses this
// instance, so the registry genuinely has to be rebuilt for a new document.
// `defaultZoomLevel` is only an initial value, so recomputing it on resize
// bought nothing while costing a full re-registration — and a document reload —
// on every single resize event.
const plugins = computed(() => {
  const base = [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments: [{ url: props.pdfUrl }],
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage),
    createPluginRegistration(RenderPluginPackage),
    createPluginRegistration(RotatePluginPackage),
    createPluginRegistration(ZoomPluginPackage, {
      defaultZoomLevel:
        props.layoutMode === "exam-with-facit"
          ? ZoomMode.FitWidth
          : windowWidth < 1100
            ? ZoomMode.FitWidth
            : ZoomMode.Automatic,
    }),
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
                                  />
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
