<script setup lang="ts">
import {
  VisAxis,
  VisCrosshair,
  VisPlotline,
  VisStackedBar,
  VisTooltip,
  VisXYContainer,
} from "@unovis/vue";
import { Position, Scale } from "@unovis/ts";
import type { PassRatePoint } from "~/composables/useCourseStats";

const props = defineProps<{
  points: PassRatePoint[];
  average: number;
}>();

const measured = computed(() =>
  props.points.filter((p) => p.rate !== undefined),
);

// Tentatillfällena ligger inte jämnt i tiden: vissa år saknar tentor helt medan
// ett aktivt år kan ha sex. På en äkta tidsaxel blir det stora tomrum och
// klungor som klibbar ihop. Vi ritar därför en stapel per tillfälle med samma
// bredd (index som x) och låter årsetiketterna bära tidsinformationen i stället.
const xScale = Scale.scaleLinear();

const x = (_d: PassRatePoint, i: number) => i;
const y = (d: PassRatePoint) => d.rate;

// Halvt steg i varje ände så att den första och sista stapeln inte klipps.
const xDomain = computed<[number, number]>(() => [
  -0.5,
  Math.max(measured.value.length - 1, 0) + 0.5,
]);

const yTicks = [0, 25, 50, 75, 100];

// Staplarna skuggas efter andelen godkända: låg andel ger en blek ton, hög ger
// en mättad. Trösklarna är absoluta så att samma färg betyder samma sak när man
// jämför två kurser. Ramp-tokens är temamedvetna — ljust tema går blekt → djupt,
// mörkt tema dovt → ljust — så "starkare färg = högre andel" gäller i båda.
const RATE_SHADES = [
  { min: 80, color: "var(--chart-5)" },
  { min: 60, color: "var(--chart-4)" },
  { min: 40, color: "var(--chart-3)" },
  { min: 20, color: "var(--chart-2)" },
  { min: 0, color: "var(--chart-1)" },
];

function barColor(d: PassRatePoint) {
  const rate = d.rate ?? 0;

  return (
    RATE_SHADES.find((shade) => rate >= shade.min)?.color ?? "var(--chart-1)"
  );
}

// Staplarna ligger i kronologisk ordning, så varje år upptar ett sammanhängande
// spann av index. Vi märker upp spannets mitt med årtalet och drar en tunn linje
// vid varje årsskifte — det är den som gör klungorna läsbara.
const yearGroups = computed(() => {
  const groups: { year: number; start: number; end: number }[] = [];

  measured.value.forEach((point, i) => {
    const year = new Date(point.timestamp).getFullYear();
    const current = groups.at(-1);

    if (current && current.year === year) current.end = i;
    else groups.push({ year, start: i, end: i });
  });

  return groups;
});

const yearTicks = computed(() =>
  yearGroups.value.map((g) => (g.start + g.end) / 2),
);

const yearLabels = computed(
  () =>
    new Map(
      yearGroups.value.map((g) => [(g.start + g.end) / 2, String(g.year)]),
    ),
);

const yearBoundaries = computed(() =>
  yearGroups.value.slice(1).map((g) => g.start - 0.5),
);

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
    <VisXYContainer
      :data="measured"
      :height="300"
      :x-scale="xScale"
      :x-domain="xDomain"
      :y-domain="[0, 100]"
      :margin="{ top: 16, right: 12, bottom: 0, left: 0 }"
      :duration="200"
      :on-render-complete="onRenderComplete"
    >

      <VisPlotline
        v-for="boundary in yearBoundaries"
        :key="`year-${boundary}`"
        :value="boundary"
        axis="x"
        color="var(--vis-year-separator-color)"
        :line-width="1"
        :duration="0"
      />

      <VisStackedBar
        :x="x"
        :y="y"
        :color="barColor"
        :dataStep="1"
        :barMaxWidth="34"
        :barPadding="0.25"
        :roundedCorners="4"
        :barMinHeight1Px="true"
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
        :tick-values="yearTicks"
        :tick-text-hide-overlapping="true"
        :tick-format="(t: number | Date) => yearLabels.get(Number(t)) ?? ''"
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
        :circle-radius="0"
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
  --vis-year-separator-color: color-mix(
    in oklch,
    var(--border) 70%,
    transparent
  );

  --vis-plotline-color: color-mix(in oklch, var(--foreground) 45%, transparent);
  --vis-plotline-label-font-size: 11px;

  --vis-crosshair-line-stroke-opacity: 0.35;
}
</style>
