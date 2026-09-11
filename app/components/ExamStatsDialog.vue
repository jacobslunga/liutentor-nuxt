<script setup lang="ts">
const props = defineProps<{
  statistics: Record<string, number> | null;
  date: string;
  passRate: number;
}>();

const total = computed(() =>
  Object.values(props.statistics ?? {}).reduce((a, b) => a + b, 0),
);

const chartData = computed(() =>
  gradeOrder
    .filter((g) => ((props.statistics ?? {})[g] ?? 0) > 0)
    .map((grade) => ({
      grade,
      count: (props.statistics ?? {})[grade] ?? 0,
      color: gradeColors[grade] ?? "var(--chart-3)",
    })),
);

const gradeOrder = ["3", "4", "5", "G", "VG", "U"];

const gradeColors: Record<string, string> = {
  "3": "var(--chart-3)",
  "4": "var(--chart-4)",
  "5": "var(--chart-5)",
  "G": "var(--chart-2)",
  "VG": "var(--chart-1)",
  "U": "var(--chart-1)",
};

const maxCount = computed(() =>
  Math.max(...chartData.value.map((d) => d.count)),
);

function passColor(rate: number) {
  if (rate >= 50) return "text-success";
  if (rate >= 30) return "text-warning";
  return "text-error";
}
</script>

<template>

  <UIcon name="i-lucide-minus" v-if="total === 0" class="w-4 h-4 text-muted/30" />

  <UModal v-else title="Tentastatistik" :description="`Betygsfördelning ${date}`">
    <button type="button"
      class="text-sm cursor-pointer px-2 py-1 rounded-sm hover:bg-primary/10 transition-colors duration-150"
      :class="passColor(passRate)" @click.prevent.stop>
      {{ passRate.toFixed(1) }}%
    </button>

    <template #body="{ close }">
      <div class="flex flex-col gap-4" @click.stop>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">{{ total }} studenter</span>
            <span class="font-mono" :class="passColor(passRate)">
              {{ passRate }}% godkänt
            </span>
          </div>

          <div class="border border-default rounded-md p-3">
            <div class="flex items-end gap-2 h-32">
              <div v-for="{ grade, count, color } in chartData" :key="grade"
                class="flex-1 flex flex-col items-center gap-1">
                <span class="text-2xs text-muted">{{ count }}</span>
                <div class="w-full rounded-t-sm" :style="{
                  height: `${(count / maxCount) * 88}px`,
                  backgroundColor: color,
                }" />
                <span class="text-2xs text-muted">{{ grade }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div v-for="{ grade, count, color } in chartData" :key="grade"
              class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-md" :style="{ backgroundColor: color }" />
                <span class="text-highlighted">Betyg {{ grade }}</span>
              </div>
              <span class="text-muted">
                {{ count }} ({{ ((count / total) * 100).toFixed(1) }}%)
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-default/60 text-xs text-muted">
          <span>
            Data från
            <a href="https://ysektionen.se/student/tentastatistik/" target="_blank"
              class="text-primary hover:underline">
              Y-Sektionen
            </a>
          </span>
          <button type="button" class="hover:text-highlighted transition-colors cursor-pointer" @click="close()">
            Stäng
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
