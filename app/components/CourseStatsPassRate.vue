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

// A pass rate of exactly 0 is how the scrape represents "not recorded", so
// those sittings arrive with `rate: undefined`. Dropping them rather than
// letting the line break: the gap is already visible on the time scale — the
// curve simply spans it — and a broken line at this density reads as a bug.
const measured = computed(() =>
  props.points.filter((p) => p.rate !== undefined),
);

// Unique per instance so two of these charts on one page (unlikely, but the
// tab can remount) don't fight over the same gradient id.
const gradientId = `${useId()}-pass-rate-area`;

// A time scale rather than an evenly-spaced category axis: exam sittings are
// irregular, and a one-slot-per-exam layout quietly implies they aren't. A
// four-year gap looks like a four-year gap.
const xScale = Scale.scaleTime();

const x = (d: PassRatePoint) => d.timestamp;
const y = (d: PassRatePoint) => d.rate;

const yTicks = [0, 25, 50, 75, 100];

// MonotoneX rather than a basis or natural spline: those overshoot between
// points, which on a percentage axis invents sittings above 100% or below 0.
const curveType = CurveType.MonotoneX;

// A single sitting draws no line and no area — a lone dot is the only honest
// way to show it.
const isSinglePoint = computed(() => measured.value.length === 1);

// The average label is an HTML pill rather than the plotline's own text: an
// SVG <text> has no background, so it disappeared wherever the curve or its
// fill ran behind it. Positioning it needs the plot area in pixels, which the
// container hands over after every render (including resizes).
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
  // Hidden rather than parked at 0,0 until the first render reports geometry.
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

// The threshold colours the bars used to carry survive on the tooltip's
// number: one continuous stroke can't change colour per sitting, but the
// reader still wants to know whether the point under the cursor was a good
// result or a bad one.
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

// Math.round, matching the header on the course page: the two numbers are the
// same figure and must not round apart at a .5.
const averageLabel = computed(() => `Snitt ${Math.round(props.average)}%`);
</script>

<template>
  <div class="vis-chart pass-rate-chart relative w-full">
    <!-- Not rendered directly; referenced by id from the area fill below. -->
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
      <!-- Area first, line second: the stroke has to sit on top of its own
           fill, not be washed out by it. -->
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

      <!-- One sitting: the curve components draw nothing, so mark the value. -->
      <VisScatter
        v-if="isSinglePoint"
        :x="x"
        :y="y"
        :size="7"
        :color="tokens.success"
      />

      <!-- The one reference the reader actually wants: is this sitting above or
           below what the course usually does? Dashed because it is a reference
           rather than data — the grid stays solid. Its label is the pill
           below. -->
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

      <!-- Snapping to the nearest sitting rather than requiring a hit on the
           curve itself: the line is a two-pixel stroke, which is not a pointer
           target on a phone. -->
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

    <!-- Anchored to the left edge of the plot rather than the right: a
         right-anchored label collides with the curve wherever the last sitting
         happens to land. `pointer-events-none` keeps it from stealing hovers
         from the crosshair underneath. -->
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
  /* Recessive enough to stay behind the curve, dark enough to survive being
     drawn over it. */
  --vis-plotline-color: color-mix(in oklch, var(--foreground) 45%, transparent);
  --vis-plotline-label-font-size: 11px;
  /* The crosshair line would otherwise sit on top of the point it marks. */
  --vis-crosshair-line-stroke-opacity: 0.35;
}
</style>
