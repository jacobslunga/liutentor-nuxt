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

const isMobile = ref(window.innerWidth < 1024);
const windowWidth = ref(window.innerWidth);
const viewportEl = ref<HTMLElement | null>(null);
const showScrollTop = ref(false);

onMounted(() => {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 1024;
    windowWidth.value = window.innerWidth;
  });
});

function handleViewportScroll(event: Event) {
  const target = event.currentTarget as HTMLElement;
  viewportEl.value = target;
  showScrollTop.value = target.scrollTop > 320;
}

function scrollToTop() {
  viewportEl.value?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

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
          : windowWidth.value < 1100
            ? ZoomMode.FitWidth
            : ZoomMode.Automatic,
    }),
  ];

  if (isMobile.value) {
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
                          class="relative h-full w-full"
                        >
                          <div
                            class="absolute inset-0 z-0 pdf-render-surface"
                            :style="
                              isDark
                                ? { filter: 'invert(10%) hue-rotate(10deg)' }
                                : {}
                            "
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
                                class="relative h-full w-full"
                              >
                                <div
                                  class="absolute inset-0 z-0 pdf-render-surface"
                                  :style="
                                    isDark
                                      ? {
                                          filter:
                                            'invert(88%) hue-rotate(180deg)',
                                        }
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
                  </PdfInner>
                </template>
              </Viewport>

              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 translate-y-2 scale-95"
              >
                <Button
                  v-if="showScrollTop"
                  variant="ghost"
                  size="icon-sm"
                  class="absolute bottom-4 right-4 z-30 border border-border bg-background/90 shadow-sm backdrop-blur"
                  aria-label="Scrolla till toppen"
                  @click="scrollToTop"
                >
                  <LucideArrowUp class="h-4 w-4" />
                </Button>
              </Transition>
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
