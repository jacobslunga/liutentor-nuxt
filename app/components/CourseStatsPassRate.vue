<script setup lang="ts">
import {
  VisAxis,
  VisCrosshair,
  VisPlotline,
  VisStackedBar,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";
import { PlotlineLabelPosition, Position, Scale } from "@unovis/ts";
import { useElementSize } from "@vueuse/core";
import type { PassRatePoint } from "~/composables/useCourseStats";

const props = defineProps<{
  points: PassRatePoint[];
  average: number;
}>();

const tokens = useChartTokens([
  "background",
  "destructive",
  "foreground",
  "success",
  "warning",
] as const);

// Same thresholds as the pass rate in the course header, so a sitting that
// reads as red there is red here too.
//
// A computed returning the accessor rather than a plain function: unovis only
// re-reads `color` when the prop itself changes, and a stable function never
// does — the bars would keep the palette they were first handed when the
// colour mode flips.
const barColor = computed(() => (d: PassRatePoint) => {
  const rate = d.rate ?? 0;
  if (rate >= 50) return tokens.value.success;
  if (rate >= 30) return tokens.value.warning;
  return tokens.value.destructive;
});

// A time scale rather than an evenly-spaced category axis: exam sittings are
// irregular, and a one-slot-per-exam layout quietly implies they aren't. A
// four-year gap looks like a four-year gap.
const xScale = Scale.scaleTime();

const x = (d: PassRatePoint) => d.timestamp;
const y = (d: PassRatePoint) => d.rate;

const yTicks = [0, 25, 50, 75, 100];

// Bars, not a line: each value is one sitting, a closed event with nothing
// between it and the next. A line would draw a value for every day in the gap.
// On a time scale unovis derives bar width from the smallest gap in the data,
// which turns every bar into a hairline as soon as two retakes fall a fortnight
// apart — so the width is set from the space each sitting actually gets.
const chartEl = ref<HTMLElement | null>(null);
const { width: chartWidth } = useElementSize(chartEl);

/** Roughly what the "100%" tick label reserves on the left. */
const Y_AXIS_WIDTH = 44;

const barWidth = computed(() => {
  const count = props.points.length || 1;
  // Falls back to a typical container on the server pass, where nothing is
  // measured yet; the ref resolves on mount and the bars settle.
  const plotWidth = (chartWidth.value || 640) - Y_AXIS_WIDTH;
  return Math.round(Math.min(20, Math.max(3, (plotWidth / count) * 0.62)));
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
        <span class="text-lg font-semibold leading-none text-foreground">${d.rate.toFixed(1)}%</span>
        <span class="text-xs text-muted-foreground">godkända</span>
      </div>
      <div class="mt-1.5 text-xs text-muted-foreground">${names}</div>
      ${students}
    </div>
  `;
}

// Math.round, matching the header on the course page: the two numbers are the
// same figure and must not round apart at a .5.
const averageLabel = computed(() => `Snitt ${Math.round(props.average)}%`);
</script>

<template>
  <div ref="chartEl" class="vis-chart pass-rate-chart w-full">
    <VisXYContainer
      :data="points"
      :height="300"
      :x-scale="xScale"
      :y-domain="[0, 100]"
      :margin="{ top: 16, right: 12, bottom: 0, left: 0 }"
      :duration="200"
    >
      <VisStackedBar
        :x="x"
        :y="y"
        :color="barColor"
        :bar-width="barWidth"
        :rounded-corners="3"
      />

      <!-- The one reference the reader actually wants: is this sitting above or
           below what the course usually does? Dashed and anchored at the left
           edge — dashed because it is a reference rather than data (the grid
           stays solid), left because a right-anchored label collides with the
           bars wherever the last sitting happens to land. -->
      <VisPlotline
        :value="average"
        axis="y"
        :line-width="1"
        :line-style="[5, 4]"
        :label-text="averageLabel"
        :label-position="PlotlineLabelPosition.TopLeft"
        :label-color="tokens.foreground"
        :label-size="11"
        :label-offset-x="2"
        :label-offset-y="8"
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

      <!-- Snapping to the nearest sitting rather than requiring a hit on the
           bar itself: at this density a bar is a few pixels wide, which is not
           a pointer target on a phone. -->
      <VisCrosshair
        :x="x"
        :y="y"
        :color="barColor"
        :circle-radius="3"
        :stroke-color="tokens.background"
        :stroke-width="2"
        :template="tooltipTemplate"
      />
      <VisTooltip />
    </VisXYContainer>
  </div>
</template>

<style scoped>
.pass-rate-chart {
  /* Recessive enough to stay behind the bars, dark enough to survive being
     drawn over them. */
  --vis-plotline-color: color-mix(in oklch, var(--foreground) 45%, transparent);
  --vis-plotline-label-font-size: 11px;
  /* The crosshair line would otherwise sit on top of the bar it points at. */
  --vis-crosshair-line-stroke-opacity: 0.35;
}
</style>
