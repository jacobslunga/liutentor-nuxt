<script setup lang="ts">
import {
  VisArea,
  VisAxis,
  VisCrosshair,
  VisLine,
  VisPlotline,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";
import {
  CurveType,
  PlotlineLabelPosition,
  Position,
  Scale,
} from "@unovis/ts";
import type { PassRatePoint } from "~/composables/useCourseStats";

const props = defineProps<{
  points: PassRatePoint[];
  average: number;
}>();

const tokens = useChartTokens([
  "primary",
  "background",
  "foreground",
] as const);

// A time scale rather than an evenly-spaced category axis: exam sittings are
// irregular, and the old bar chart's one-slot-per-exam layout quietly implied
// they weren't. A four-year gap now looks like a four-year gap.
const xScale = Scale.scaleTime();

const x = (d: PassRatePoint) => d.timestamp;
const y = (d: PassRatePoint) => d.rate;

const yTicks = [0, 25, 50, 75, 100];

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

const averageLabel = computed(() => `Snitt ${props.average.toFixed(0)}%`);
</script>

<template>
  <div class="vis-chart pass-rate-chart w-full">
    <VisXYContainer
      :data="points"
      :height="300"
      :x-scale="xScale"
      :y-domain="[0, 100]"
      :margin="{ top: 16, right: 8, bottom: 0, left: 0 }"
    >
      <VisArea
        :x="x"
        :y="y"
        :color="tokens.primary"
        :curve-type="CurveType.MonotoneX"
      />
      <VisLine
        :x="x"
        :y="y"
        :color="tokens.primary"
        :line-width="2"
        :curve-type="CurveType.MonotoneX"
      />

      <!-- The one reference the reader actually wants: is this sitting above or
           below what the course usually does? Dashed and anchored at the left
           edge — dashed because it is a reference rather than data (the grid
           stays solid), left because a right-anchored label collides with the
           series wherever the last sitting happens to land. -->
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

      <VisCrosshair
        :x="x"
        :y="y"
        :color="tokens.primary"
        :circle-radius="4"
        :stroke-color="tokens.background"
        :stroke-width="2"
        :template="tooltipTemplate"
      />
      <VisTooltip />
    </VisXYContainer>
  </div>
</template>

<style scoped>
/* A wash, not a block — the line carries the value, the fill only ties it to
   the baseline.
   The hover values have to be set too: unovis defaults them to the literal
   `none`, which is invalid for `fill-opacity`, so the browser falls back to the
   initial value of 1 and the whole area goes solid the moment the pointer
   enters it. */
.pass-rate-chart {
  --vis-area-fill-opacity: 0.12;
  --vis-area-hover-fill-opacity: 0.12;
  --vis-area-hover-stroke-width: 0px;
  /* Recessive enough to stay behind the series, dark enough to survive being
     drawn over the fill. */
  --vis-plotline-color: color-mix(in oklch, var(--foreground) 45%, transparent);
  --vis-plotline-label-font-size: 11px;
}
</style>
