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

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

definePageMeta({ layout: "search" });

const route = useRoute();
const courseCode = route.params.courseCode as string;
const { data, status } = useFetch(`/api/exams/${courseCode}`);

const courseData = computed(() => (data.value as any)?.data);
const exams = computed(() => courseData.value?.exams ?? []);

watchEffect(() => {
  if (!courseData.value) return;
  useSeoMeta({
    title: `Statistik för ${courseCode} - ${courseData.value.courseName}`,
    description: `Detaljerad statistik för ${courseCode}`,
  });
});

const sorted = computed(() =>
  [...exams.value].sort(
    (a: any, b: any) =>
      new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime(),
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
  labels: sorted.value.map((e: any) => e.exam_date.slice(0, 10)),
  datasets: [
    {
      data: sorted.value.map((e: any) => Number(e.pass_rate ?? 0)),
      backgroundColor: sorted.value.map((e: any) =>
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
      callbacks: { label: (ctx: any) => ` ${ctx.raw}%` },
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
        callback: (v: any) => `${v}%`,
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
    "U": 0,
    "G": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  sorted.value.forEach((e: any) => {
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
      callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw}` },
    },
  },
}));
</script>

<template>
  <div class="bg-background min-h-screen w-full">
    <div class="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
      <div
        v-if="status === 'pending'"
        class="flex items-center justify-center min-h-[60vh]"
      >
        <LucideLoader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <template v-else-if="courseData">
        <div class="flex flex-col gap-5 w-full">
          <div class="flex flex-col gap-1">
            <div
              class="flex items-center gap-2 text-sm text-muted-foreground/70"
            >
              <span class="font-medium text-foreground/80">{{
                courseCode
              }}</span>
              <span>/</span>
              <span>Statistik</span>
            </div>
            <h1
              class="font-semibold text-foreground max-w-3xl leading-tight text-2xl sm:text-3xl"
            >
              {{ courseData.courseName }}
            </h1>
          </div>

          <div
            class="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div class="p-5 border-b border-border/60 bg-muted/20">
              <div class="flex items-center gap-2 mb-1">
                <LucideTrendingUp class="w-4 h-4 text-primary" />
                <h2 class="text-sm font-medium">Godkända över tid</h2>
              </div>
              <p class="text-xs text-muted-foreground">
                Procentuell andel godkända per tenta
              </p>
            </div>
            <div class="p-5">
              <div class="h-72 w-full">
                <ClientOnly>
                  <Bar :data="passChartData" :options="passChartOptions" />
                </ClientOnly>
              </div>
            </div>
          </div>

          <div
            class="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div class="p-5 border-b border-border/60 bg-muted/20">
              <div class="flex items-center gap-2 mb-1">
                <LucidePieChart class="w-4 h-4 text-primary" />
                <h2 class="text-sm font-medium">Betygsfördelning</h2>
              </div>
              <p class="text-xs text-muted-foreground">
                Total fördelning av betyg
              </p>
            </div>
            <div class="p-5 flex flex-col md:flex-row gap-8 items-center">
              <div class="h-64 w-full md:w-1/2">
                <ClientOnly>
                  <Doughnut :data="donutData" :options="donutOptions" />
                </ClientOnly>
              </div>
              <div class="w-full md:w-1/2 space-y-2">
                <div
                  v-for="d in aggregate.entries"
                  :key="d.key"
                  class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="block w-2.5 h-2.5 rounded-full"
                      :style="{ background: d.color }"
                    />
                    <span class="text-sm">Betyg {{ d.label }}</span>
                  </div>
                  <div class="flex items-center gap-3 text-right">
                    <span class="text-xs text-muted-foreground tabular-nums">
                      {{ d.value.toLocaleString("sv-SE") }}
                    </span>
                    <span
                      class="text-xs font-medium tabular-nums bg-muted px-2 py-0.5 rounded-md"
                    >
                      {{ d.pct.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 z-50 pointer-events-none">
            <div
              class="bg-linear-to-t from-background via-background/80 to-transparent pt-8 pb-10"
            >
              <div class="flex items-center justify-center pointer-events-auto">
                <ButtonGroup class="pointer-events-auto">
                  <Button variant="default" size="sm" as-child>
                    <NuxtLink to="/upload-exams">
                      <LucideUpload class="w-4.5 h-4.5" />
                      Ladda upp
                    </NuxtLink>
                  </Button>
                  <Button variant="outline" size="sm" as-child>
                    <NuxtLink :to="`/search/${courseCode}`">
                      <LucideBookA class="w-4.5 h-4.5" />
                      Visa tentor
                    </NuxtLink>
                  </Button>
                  <Button variant="outline" size="sm" as-child>
                    <NuxtLink :to="`/quiz/${courseCode}`">
                      <LucideLayers class="w-4.5 h-4.5" />
                      Quiz
                    </NuxtLink>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
