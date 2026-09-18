<script setup lang="ts">
import { computed } from "vue";
import { useRotate } from "@embedpdf/plugin-rotate/vue";
import { useZoom } from "@embedpdf/plugin-zoom/vue";

const props = defineProps<{ documentId: string; isMobile: boolean }>();

const { state, provides: zoom } = useZoom(() => props.documentId);

const { provides: rotate } = useRotate(() => props.documentId);

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 10;
const EPSILON = 0.001;

const currentZoom = computed(() => state.value?.currentZoomLevel ?? 1);
const canZoomIn = computed(() => currentZoom.value < MAX_ZOOM - EPSILON);
const canZoomOut = computed(() => currentZoom.value > MIN_ZOOM + EPSILON);
</script>

<template>
  <div
    class="flex items-center overflow-hidden rounded-xl border border-default bg-default/95 backdrop-blur-sm shadow-sm"
  >
    <button
      type="button"
      aria-label="Zooma in"
      :disabled="!canZoomIn"
      class="flex size-10 items-center justify-center text-muted transition-colors active:bg-elevated disabled:opacity-35 disabled:active:bg-transparent"
      @click="zoom?.zoomIn()"
    >
      <UIcon name="i-openai-plus" class="size-4" />
    </button>
    <div class="h-5 w-px bg-border" />
    <button
      type="button"
      aria-label="Zooma ut"
      :disabled="!canZoomOut"
      class="flex size-10 items-center justify-center text-muted transition-colors active:bg-elevated disabled:opacity-35 disabled:active:bg-transparent"
      @click="zoom?.zoomOut()"
    >
      <UIcon name="i-openai-minus" class="size-4" />
    </button>
    <div class="h-5 w-px bg-border" />
    <button
      type="button"
      aria-label="Rotera medurs"
      :disabled="!rotate"
      class="flex size-10 items-center justify-center text-muted transition-colors active:bg-elevated disabled:opacity-35"
      @click="rotate?.rotateForward()"
    >
      <UIcon name="i-openai-rotate-clockwise" class="size-4" />
    </button>
  </div>
</template>
