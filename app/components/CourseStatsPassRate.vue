<script setup lang="ts">
import {
  VisArea,
  VisAxis,
  VisCrosshair,
  VisLine,
  VisPlotline,
  VisScatter,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";
import { CurveType, Position, Scale } from "@unovis/ts";
import type { PassRatePoint } from "~/composables/useCourseStats";

const props = defineProps<{
  points: PassRatePoint[];
  average: number;
}>();

const tokens = useChartTokens(["background", "success"] as const);

const measured = computed(() =>
  props.points.filter((p) => p.rate !== undefined),
);

const gradientId = `${useId()}-pass-rate-area`;

const xScale = Scale.scaleTime();

const x = (d: PassRatePoint) => d.timestamp;
const y = (d: PassRatePoint) => d.rate;

const yTicks = [0, 25, 50, 75, 100];

const curveType = CurveType.MonotoneX;

const isSinglePoint = computed(() => measured.value.length === 1);

const plotBox = ref<{ top: number; bottom: number; left: number } | null>(null);

type Spacing = { top: number; bottom: number; left: number; right: number };

function onRenderComplete(
  _svg: SVGSVGElement,
  margin: Spacing,
  bleed: Spacing,
  _containerWidth: number,
  _containerHeight: number,
  _width: number,
  height: number,
) {
  plotBox.value = {
    top: margin.top + bleed.top,
    bottom: margin.top + height - bleed.bottom,
    left: margin.left + bleed.left,
  };
}

const averageStyle = computed(() => {
  const box = plotBox.value;

  if (!box) return { opacity: "0" };

  const t = Math.min(Math.max(props.average, 0), 100) / 100;
  const y = box.bottom - t * (box.bottom - box.top);

  return { top: `${y}px`, left: `${box.left + 6}px` };
});

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

function passClass(rate: number) {
  if (rate >= 50) return "text-success";
  if (rate >= 30) return "text-warning";
  return "text-destructive";
}

function tooltipTemplate(d: PassRatePoint) {
  if (!d || d.rate === undefined) return "";

  const names = escapeHtml(d.names.join(" · "));
  const students = d.students
    ? `<div class="text-xs text-muted-foreground">${d.students.toLocaleString("sv-SE")} studenter</div>`
    : "";

  return `
    <div class="min-w-40 px-3 py-2.5">
      <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        ${escapeHtml(dateFormatter.format(new Date(d.timestamp)))}
      </div>
      <div class="mt-1.5 flex items-baseline gap-1.5">
        <span class="text-lg font-semibold leading-none ${passClass(d.rate)}">${d.rate.toFixed(1)}%</span>
        <span class="text-xs text-muted-foreground">godkända</span>
      </div>
      <div class="mt-1.5 text-xs text-muted-foreground">${names}</div>
      ${students}
    </div>
  `;
}

const averageLabel = computed(() => `Snitt ${Math.round(props.average)}%`);
</script>

<template>
  <div class="vis-chart pass-rate-chart relative w-full">

    <svg width="0" height="0" class="absolute" aria-hidden="true">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="tokens.success" stop-opacity="0.32" />
          <stop offset="55%" :stop-color="tokens.success" stop-opacity="0.12" />
          <stop offset="100%" :stop-color="tokens.success" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>

    <VisXYContainer
      :data="measured"
      :height="300"
      :x-scale="xScale"
      :y-domain="[0, 100]"
      :margin="{ top: 16, right: 12, bottom: 0, left: 0 }"
      :duration="200"
      :on-render-complete="onRenderComplete"
    >

      <VisArea
        :x="x"
        :y="y"
        :curve-type="curveType"
        :color="`url(#${gradientId})`"
        :baseline="0"
      />
      <VisLine
        :x="x"
        :y="y"
        :curve-type="curveType"
        :color="tokens.success"
        :line-width="2"
      />

      <VisScatter
        v-if="isSinglePoint"
        :x="x"
        :y="y"
        :size="7"
        :color="tokens.success"
      />

      <VisPlotline
        :value="average"
        axis="y"
        :line-width="1"
        :line-style="[5, 4]"
      />

      <VisAxis
        type="x"
        :position="Position.Bottom"
        :grid-line="false"
        :tick-line="false"
        :domain-line="false"
        :num-ticks="6"
        :tick-text-hide-overlapping="true"
        :tick-format="(t: number | Date) => String(new Date(t).getFullYear())"
      />
      <VisAxis
        type="y"
        :position="Position.Left"
        :tick-values="yTicks"
        :tick-line="false"
        :domain-line="false"
        :tick-format="(v: number | Date) => `${v}%`"
      />

      <VisCrosshair
        :x="x"
        :y="y"
        :color="tokens.success"
        :circle-radius="3"
        :stroke-color="tokens.background"
        :stroke-width="2"
        :template="tooltipTemplate"
      />
      <VisTooltip />
    </VisXYContainer>

    <span
      class="pointer-events-none absolute -translate-y-1/2 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-[2px]"
      :style="averageStyle"
    >
      {{ averageLabel }}
    </span>
  </div>
</template>

<style scoped>
.pass-rate-chart {

  --vis-plotline-color: color-mix(in oklch, var(--foreground) 45%, transparent);
  --vis-plotline-label-font-size: 11px;

  --vis-crosshair-line-stroke-opacity: 0.35;
}
</style>
