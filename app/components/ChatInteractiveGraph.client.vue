<script setup lang="ts">
import type { Expression } from "expr-eval";
import type JXG from "jsxgraph";
import type { InteractiveGraphSpec } from "@/lib/interactive-graph";
import {
  compileGraphExpression,
  evaluateGraphExpression,
} from "@/lib/graph-expression";

const props = defineProps<{ spec: InteractiveGraphSpec }>();

const boardHost = ref<HTMLDivElement | null>(null);
const renderError = ref<string | null>(null);
const parameterValues = reactive<Record<string, number>>({});

let board: JXG.Board | null = null;
let JSXGraphApi: typeof JXG | null = null;
// renderBoard awaits a dynamic import, so the component can unmount mid-flight.
// Anything after that await has to re-check both the host element and this flag.
let disposed = false;
const controlPrefix = `graph-${crypto.randomUUID()}`;

const SERIES_COLORS = ["#2563eb", "#ea580c", "#7c3aed", "#059669"];

for (const parameter of props.spec.parameters) {
  parameterValues[parameter.id] = parameter.initial;
}

function compileExpression(source: string): Expression {
  return compileGraphExpression(
    source,
    props.spec.parameters.map((item) => item.id),
  );
}

function evaluate(expression: Expression, x: number): number {
  return evaluateGraphExpression(expression, x, parameterValues);
}

async function renderBoard() {
  if (!boardHost.value) return;

  try {
    renderError.value = null;
    const module = await import("jsxgraph");
    if (disposed || !boardHost.value) return;

    const JXGraph = (module.default ?? module) as typeof JXG;
    JSXGraphApi = JXGraph;
    const foreground = getComputedStyle(document.documentElement)
      .getPropertyValue("--foreground")
      .trim() || "#242424";
    const muted = getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")
      .trim() || "#737373";

    board = JXGraph.JSXGraph.initBoard(boardHost.value, {
      boundingbox: [
        props.spec.xAxis.min,
        props.spec.yAxis.max,
        props.spec.xAxis.max,
        props.spec.yAxis.min,
      ],
      axis: true,
      defaultAxes: {
        x: {
          name: props.spec.xAxis.label ?? "x",
          strokeColor: muted,
          ticks: { strokeColor: muted, label: { color: foreground } },
          label: { color: foreground },
        },
        y: {
          name: props.spec.yAxis.label ?? "y",
          strokeColor: muted,
          ticks: { strokeColor: muted, label: { color: foreground } },
          label: { color: foreground },
        },
      },
      description: props.spec.description ?? props.spec.title,
      grid: props.spec.showGrid,
      keepAspectRatio: false,
      pan: { enabled: true, needShift: false, needTwoFingers: false },
      resize: { enabled: true, throttle: 100 },
      showCopyright: false,
      showFullscreen: false,
      showNavigation: true,
      showReload: false,
      showZoom: true,
      title: props.spec.title,
      zoom: {
        wheel: true,
        needShift: false,
        pinchHorizontal: true,
        pinchVertical: true,
      },
    });

    board.suspendUpdate();
    props.spec.series.forEach((series, index) => {
      const expression = compileExpression(series.expression);
      board?.create("functiongraph", [(x: number) => evaluate(expression, x)], {
        dash: series.style === "dashed" ? 2 : 0,
        highlight: false,
        strokeColor: SERIES_COLORS[index % SERIES_COLORS.length],
        strokeWidth: 2.5,
      });
    });

    props.spec.points.forEach((point) => {
      board?.create("point", [point.x, point.y], {
        color: foreground,
        fixed: true,
        name: point.label ?? "",
        size: 3,
      });
    });
    board.unsuspendUpdate();

    // Unmounting during any of the above leaves onBeforeUnmount nothing to free,
    // so the board would outlive its host. Free it here instead.
    if (disposed) {
      JXGraph.JSXGraph.freeBoard(board);
      board = null;
    }
  } catch (error) {
    renderError.value =
      error instanceof Error ? error.message : "Grafen kunde inte ritas.";
  }
}

function updateParameter(id: string, event: Event) {
  const input = event.target as HTMLInputElement;
  parameterValues[id] = Number(input.value);
  board?.update();
}

function resetGraph() {
  for (const parameter of props.spec.parameters) {
    parameterValues[parameter.id] = parameter.initial;
  }
  board?.setBoundingBox(
    [
      props.spec.xAxis.min,
      props.spec.yAxis.max,
      props.spec.xAxis.max,
      props.spec.yAxis.min,
    ],
    false,
  );
  board?.update();
}

function formatValue(value: number, step: number): string {
  const decimals = Math.min(6, Math.max(0, (String(step).split(".")[1] ?? "").length));
  return value.toFixed(decimals);
}

onMounted(renderBoard);

onBeforeUnmount(() => {
  disposed = true;
  if (!board || !JSXGraphApi) return;
  JSXGraphApi.JSXGraph.freeBoard(board);
  board = null;
});
</script>

<template>
  <section class="interactive-graph" :aria-label="spec.title">
    <header class="interactive-graph-header">
      <div class="min-w-0">
        <h3>{{ spec.title }}</h3>
        <p v-if="spec.description">{{ spec.description }}</p>
      </div>
      <button type="button" class="graph-reset" @click="resetGraph">
        <LucideRotateCcw class="size-3.5" />
        Återställ
      </button>
    </header>

    <div v-if="renderError" class="graph-error" role="alert">
      <LucideTriangleAlert class="size-4 shrink-0" />
      <span>Grafen kunde inte visas: {{ renderError }}</span>
    </div>
    <div v-else ref="boardHost" class="jxgbox graph-board" />

    <div v-if="spec.series.length > 1" class="graph-legend" aria-label="Kurvor">
      <span v-for="(series, index) in spec.series" :key="`${series.label}-${index}`">
        <i :style="{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }" />
        {{ series.label }}
      </span>
    </div>

    <div v-if="spec.parameters.length" class="graph-controls">
      <label v-for="parameter in spec.parameters" :key="parameter.id">
        <span class="graph-control-label">
          <span>{{ parameter.label }}</span>
          <output :for="`${controlPrefix}-${parameter.id}`">
            {{ formatValue(parameterValues[parameter.id] ?? parameter.initial, parameter.step) }}
          </output>
        </span>
        <input
          :id="`${controlPrefix}-${parameter.id}`"
          type="range"
          :min="parameter.min"
          :max="parameter.max"
          :step="parameter.step"
          :value="parameterValues[parameter.id]"
          @input="updateParameter(parameter.id, $event)"
        />
        <span class="graph-range">
          <span>{{ parameter.min }}</span>
          <span>{{ parameter.max }}</span>
        </span>
      </label>
    </div>
  </section>
</template>

<style>
.interactive-graph .jxgbox {
  position: relative;
  overflow: hidden;
  margin: 0;
  touch-action: none;
}

.interactive-graph .jxgbox svg text {
  cursor: default;
  user-select: none;
}

.interactive-graph .JXGtext {
  margin: 0;
  padding: 0;
  background: transparent;
}

.interactive-graph .JXGinfobox {
  border: 0;
}

.interactive-graph .jxgbox :focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}

.interactive-graph .JXG_navigation {
  position: absolute;
  right: 0.4rem;
  bottom: 0.4rem;
  z-index: 10;
  display: flex;
  gap: 0.15rem;
  padding: 0.2rem;
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  border-radius: 0.55rem;
  background: color-mix(in oklch, var(--background) 88%, transparent);
  color: var(--muted-foreground);
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.interactive-graph .JXG_navigation_button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.45rem;
  min-height: 1.45rem;
  border-radius: 0.35rem;
}

.interactive-graph .JXG_navigation_button:hover {
  color: var(--foreground);
  background: var(--muted);
}

</style>

<style scoped>
.interactive-graph {
  margin: 1.25rem 0;
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
  border-radius: 1.25rem;
  background: var(--background);
  color: var(--foreground);
}

.interactive-graph-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
  background: color-mix(in oklch, var(--secondary) 55%, transparent);
}

.interactive-graph-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
}

.interactive-graph-header p {
  margin: 0.2rem 0 0;
  color: var(--muted-foreground);
  font-size: 0.78rem;
  line-height: 1.45;
}

.graph-reset {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.35rem;
  min-height: 2rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid color-mix(in oklch, var(--foreground) 12%, transparent);
  border-radius: 999px;
  color: var(--muted-foreground);
  background: var(--background);
  font-size: 0.72rem;
  cursor: pointer;
}

.graph-reset:hover {
  color: var(--foreground);
  background: var(--muted);
}

.graph-board {
  width: 100%;
  height: clamp(18rem, 55vw, 25rem);
  border: 0;
  border-radius: 0;
  background: var(--background);
  touch-action: none;
  cursor: grab;
}

.graph-board:active {
  cursor: grabbing;
}

.graph-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--destructive);
  font-size: 0.82rem;
}

.graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.65rem 1rem 0;
  color: var(--muted-foreground);
  font-size: 0.75rem;
}

.graph-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.graph-legend i {
  width: 1rem;
  height: 0.18rem;
  border-radius: 999px;
}

.graph-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr));
  gap: 0.85rem 1.25rem;
  padding: 1rem;
  border-top: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
}

.graph-controls label {
  display: grid;
  gap: 0.35rem;
}

.graph-control-label,
.graph-range {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.graph-control-label {
  font-size: 0.78rem;
  font-weight: 500;
}

.graph-control-label output {
  min-width: 3rem;
  text-align: right;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.graph-range {
  color: var(--muted-foreground);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
}

.graph-controls input[type="range"] {
  width: 100%;
  accent-color: var(--primary);
  cursor: pointer;
}

:deep(.JXGtext) {
  color: var(--foreground) !important;
  font-family: inherit !important;
}

@media (prefers-reduced-motion: reduce) {
  .graph-reset {
    transition: none;
  }
}
</style>
