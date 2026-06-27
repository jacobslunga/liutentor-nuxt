<script setup lang="ts">
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { Exam } from "~/types/exam";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const props = defineProps<{
  exams: Exam[];
}>();

const sorted = computed(() =>
  [...props.exams].sort(
    (a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime(),
  ),
);

const colorMode = useColorMode();

const resolvedColors = ref({
  chart1: "",
  chart2: "",
  chart3: "",
  chart4: "",
  chart5: "",
  destructive: "",
  mutedForeground: "",
});

function resolveColors() {
  const s = getComputedStyle(document.documentElement);
  resolvedColors.value = {
    chart1: s.getPropertyValue("--chart-1").trim(),
    chart2: s.getPropertyValue("--chart-2").trim(),
    chart3: s.getPropertyValue("--chart-3").trim(),
    chart4: s.getPropertyValue("--chart-4").trim(),
    chart5: s.getPropertyValue("--chart-5").trim(),
    destructive: s.getPropertyValue("--destructive").trim(),
    mutedForeground: s.getPropertyValue("--muted-foreground").trim(),
  };
}

onMounted(resolveColors);
watch(
  () => colorMode.value,
  () => nextTick(resolveColors),
);

function getBarColor(v: number) {
  const c = resolvedColors.value;
  if (v >= 85) return c.chart1;
  if (v >= 70) return c.chart2;
  if (v >= 60) return c.chart3;
  if (v >= 50) return c.chart4;
  if (v >= 30) return c.chart5;
  return c.destructive;
}

const gradeColors = computed(() => [
  resolvedColors.value.destructive,
  resolvedColors.value.chart2,
  resolvedColors.value.chart4,
  resolvedColors.value.chart3,
  resolvedColors.value.chart1,
]);

const passChartData = computed(() => ({
  labels: sorted.value.map((e) => e.exam_date.slice(0, 10)),
  datasets: [
    {
      data: sorted.value.map((e) => Number(e.pass_rate ?? 0)),
      backgroundColor: sorted.value.map((e) =>
        getBarColor(Number(e.pass_rate ?? 0)),
      ),
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}));

const passChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: (ctx: { raw: number }) => ` ${ctx.raw}%` },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: resolvedColors.value.mutedForeground,
        font: { size: 11 },
        maxRotation: 45,
      },
    },
    y: {
      min: 0,
      max: 100,
      grid: { color: "rgba(128,128,128,0.15)", lineWidth: 1 },
      ticks: {
        color: resolvedColors.value.mutedForeground,
        font: { size: 11 },
        callback: (v: string | number) => `${v}%`,
      },
    },
  },
}));

const gradeKeys = ["U", "G", "3", "4", "5"];

interface GradeEntry {
  key: string;
  label: string;
  value: number;
  color: string;
  pct: number;
}

const aggregate = computed<{ entries: GradeEntry[]; grand: number }>(() => {
  const totals: Record<string, number> = {
    U: 0,
    G: 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  sorted.value.forEach((e) => {
    const s = e.statistics || {};
    gradeKeys.forEach((k) => {
      totals[k] = (totals[k] ?? 0) + Number(s[k] || 0);
    });
  });
  const entries = gradeKeys
    .map((k, i) => ({
      key: k,
      label: k,
      value: totals[k] ?? 0,
      color: gradeColors.value[i] ?? "",
    }))
    .filter((d) => d.value > 0);
  const grand = entries.reduce((s, d) => s + d.value, 0);
  return {
    entries: entries.map((d) => ({
      ...d,
      pct: grand ? (d.value / grand) * 100 : 0,
    })),
    grand,
  };
});

const donutData = computed(() => ({
  labels: aggregate.value.entries.map((d) => `Betyg ${d.label}`),
  datasets: [
    {
      data: aggregate.value.entries.map((d) => d.value),
      backgroundColor: aggregate.value.entries.map((d) => d.color),
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
}));

const donutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: (ctx: { label: string; raw: number }) => ` ${ctx.label}: ${ctx.raw}` },
    },
  },
}));
</script>

<template>
  <div class="flex flex-col gap-14 w-full">
    <section class="space-y-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <LucideTrendingUp class="w-4 h-4 text-primary" />
          <h2 class="text-base font-medium text-foreground">
            Godkända över tid
          </h2>
        </div>
        <p class="text-sm text-muted-foreground">
          Procentuell andel godkända per tenta
        </p>
      </div>

      <div class="h-72 w-full">
        <ClientOnly>
          <Bar :data="passChartData" :options="passChartOptions" />
        </ClientOnly>
      </div>
    </section>

    <section class="space-y-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <LucideChartPie class="w-4 h-4 text-primary" />
          <h2 class="text-base font-medium text-foreground">
            Betygsfördelning
          </h2>
        </div>
        <p class="text-sm text-muted-foreground">Total fördelning av betyg</p>
      </div>

      <div class="flex flex-col md:flex-row gap-10 md:gap-14 items-center">
        <div class="h-64 w-full md:w-1/2">
          <ClientOnly>
            <Doughnut :data="donutData" :options="donutOptions" />
          </ClientOnly>
        </div>
        <div class="w-full md:w-1/2 space-y-3">
          <div
            v-for="d in aggregate.entries"
            :key="d.key"
            class="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="block w-2.5 h-2.5 shrink-0 rounded-full"
                :style="{ background: d.color }"
              />
              <span class="truncate text-foreground">Betyg {{ d.label }}</span>
            </div>
            <span class="text-muted-foreground tabular-nums">
              {{ d.value.toLocaleString("sv-SE") }}
            </span>
            <span class="font-medium tabular-nums text-foreground">
              {{ d.pct.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
