<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { useZoom, ZoomMode } from "@embedpdf/plugin-zoom/vue";
import { useRotate } from "@embedpdf/plugin-rotate/vue";
import { pdfLiveZoomScaleKey, pdfResetZoomKey } from "@/lib/pdf-zoom";

const props = defineProps<{ documentId: string }>();

const { state, provides: zoom } = useZoom(() => props.documentId);
const { provides: rotate } = useRotate(() => props.documentId);

const resetZoom = inject(pdfResetZoomKey, null);
const liveZoomScale = inject(pdfLiveZoomScaleKey, null);

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 10;
const EPSILON = 0.001;

const currentZoom = computed(() => state.value?.currentZoomLevel ?? 1);
const canZoomIn = computed(() => currentZoom.value < MAX_ZOOM - EPSILON);
const canZoomOut = computed(() => currentZoom.value > MIN_ZOOM + EPSILON);

// A pinch only commits its zoom level once the gesture settles, so fold in the
// in-flight scale to keep the readout in step with what is on screen.
const displayZoom = computed(
  () => currentZoom.value * (liveZoomScale?.value ?? 1),
);

const inputEl = ref<HTMLInputElement | null>(null);

// Non-null only while the field is being edited; otherwise the live zoom shows.
const draft = ref<string | null>(null);

const displayValue = computed(
  () => draft.value ?? `${Math.round(displayZoom.value * 100)}%`,
);

function startEditing() {
  draft.value = String(Math.round(currentZoom.value * 100));
  nextTick(() => inputEl.value?.select());
}

function fitToWidth() {
  if (resetZoom) resetZoom();
  else zoom.value?.requestZoom(ZoomMode.FitWidth);
}

function commit() {
  const raw = draft.value;
  draft.value = null;
  if (raw === null) return;

  const parsed = Number.parseFloat(raw.replace(",", ".").replace("%", ""));

  // An empty or nonsensical value falls back to refitting the page.
  if (!Number.isFinite(parsed) || parsed <= 0) {
    fitToWidth();
    return;
  }

  const level = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parsed / 100));
  zoom.value?.requestZoom(level);
}

function cancel() {
  draft.value = null;
  inputEl.value?.blur();
}
</script>

<template>
  <div
    class="pointer-events-auto flex items-center gap-0.5 rounded-xl border border-border bg-background/80 p-0.5 opacity-20 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover/pdf:opacity-70 hover:opacity-100 has-[:focus-visible]:opacity-100">
    <button type="button" aria-label="Zooma ut" :disabled="!canZoomOut"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
      @click="zoom?.zoomOut()">
      <LucideMinus class="size-3.5" />
    </button>

    <input ref="inputEl" :value="displayValue" type="text" inputmode="numeric" aria-label="Zoomnivå i procent"
      class="w-12 rounded-lg bg-transparent py-1 text-center text-xs tabular-nums text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground focus:outline-none"
      @focus="startEditing" @input="draft = ($event.target as HTMLInputElement).value" @blur="commit"
      @keydown.enter="inputEl?.blur()" @keydown.esc="cancel" />

    <button type="button" aria-label="Zooma in" :disabled="!canZoomIn"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
      @click="zoom?.zoomIn()">
      <LucidePlus class="size-3.5" />
    </button>

    <div class="mx-0.5 h-5 w-px bg-border" />

    <button type="button" aria-label="Rotera medurs"
      class="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      @click="rotate?.rotateForward()">
      <LucideRotateCw class="size-3.5" />
    </button>
  </div>
</template>
