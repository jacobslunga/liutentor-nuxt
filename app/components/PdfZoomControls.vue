<script setup lang="ts">
import { computed } from "vue";
import { useZoom } from "@embedpdf/plugin-zoom/vue";

/**
 * Must live inside <EmbedPDF> — the zoom capability comes from the plugin
 * registry. Unlike PdfZoomController, which is renderless and keeps the zoom in
 * step with the layout, this is the reader's own handle on it.
 *
 * On mobile it is the *only* one: the pinch/wheel gesture wrapper is desktop-
 * only, and pinch is disabled even there.
 */
const props = defineProps<{ documentId: string }>();

const { state, provides: zoom } = useZoom(() => props.documentId);

// The plugin clamps to these (ZoomPlugin's own defaults, which we do not
// override at registration), so matching them here is what lets a button go
// disabled exactly when another step would be a no-op.
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 10;
const EPSILON = 0.001;

const currentZoom = computed(() => state.value?.currentZoomLevel ?? 1);
const canZoomIn = computed(() => currentZoom.value < MAX_ZOOM - EPSILON);
const canZoomOut = computed(() => currentZoom.value > MIN_ZOOM + EPSILON);
</script>

<template>
  <div
    class="flex flex-col overflow-hidden rounded-l-2xl border border-r-0 border-border bg-background/95 backdrop-blur-sm shadow-sm">
    <button type="button" aria-label="Zooma in" :disabled="!canZoomIn"
      class="flex size-10 items-center justify-center text-muted-foreground transition-colors active:bg-secondary disabled:opacity-35 disabled:active:bg-transparent"
      @click="zoom?.zoomIn()">
      <LucidePlus class="size-4" />
    </button>
    <div class="h-px bg-border" />
    <button type="button" aria-label="Zooma ut" :disabled="!canZoomOut"
      class="flex size-10 items-center justify-center text-muted-foreground transition-colors active:bg-secondary disabled:opacity-35 disabled:active:bg-transparent"
      @click="zoom?.zoomOut()">
      <LucideMinus class="size-4" />
    </button>
  </div>
</template>
