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
}>();

const colorMode = useColorMode();
const { engine, isLoading } = usePdfiumEngine();

const isDark = computed(() => colorMode.value === "dark");

const selectionColor = computed(() =>
  isDark.value
    ? "oklch(0.8332 0.088 144.73 / 0.35)"
    : "oklch(0.6193 0.1154 172.06 / 0.28)",
);

const plugins = computed(() => [
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
        : ZoomMode.Automatic,
  }),
  createPluginRegistration(InteractionManagerPluginPackage),
  createPluginRegistration(SelectionPluginPackage, {
    toleranceFactor: 2.0,
    minSelectionDragDistance: 5,
  }),
]);
</script>

<template>
  <div class="h-full w-full overflow-hidden bg-background">
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
                class="h-full w-full bg-background"
              >
                <ZoomGestureWrapper :document-id="activeDocumentId">
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
                            class="relative h-full w-full"
                          >
                            <div
                              class="absolute inset-0 z-0 pdf-render-surface"
                              :style="
                                isDark
                                  ? { filter: 'invert(92%) hue-rotate(180deg)' }
                                  : {}
                              "
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
              </Viewport>
            </template>
          </DocumentContent>
        </template>
      </template>
    </EmbedPDF>
  </div>
</template>
