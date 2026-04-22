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
  if (rate >= 50) return "text-green-500";
  if (rate >= 30) return "text-amber-500";
  return "text-red-500";
}
</script>

<template>
  <Dialog>
    <DialogTrigger
      class="text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-foreground/5 transition-colors duration-150"
      :class="passColor(passRate)"
      @click.prevent.stop
    >
      {{ passRate.toFixed(1) }}%
    </DialogTrigger>

    <DialogContent class="w-full max-w-sm" @click.stop>
      <DialogHeader>
        <DialogTitle>Tentastatistik</DialogTitle>
        <DialogDescription>Betygsfördelning {{ date }}</DialogDescription>
      </DialogHeader>

      <div v-if="total > 0" class="flex flex-col gap-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">{{ total }} studenter</span>
          <span class="font-mono" :class="passColor(passRate)">
            {{ passRate }}% godkänt
          </span>
        </div>

        <div class="border border-border rounded-md p-3">
          <div class="flex items-end gap-2 h-32">
            <div
              v-for="{ grade, count, color } in chartData"
              :key="grade"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <span class="text-[10px] text-muted-foreground">{{ count }}</span>
              <div
                class="w-full rounded-t-sm"
                :style="{
                  height: `${(count / maxCount) * 88}px`,
                  backgroundColor: color,
                }"
              />
              <span class="text-[11px] text-muted-foreground">{{ grade }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="{ grade, count, color } in chartData"
            :key="grade"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-md"
                :style="{ backgroundColor: color }"
              />
              <span class="text-foreground">Betyg {{ grade }}</span>
            </div>
            <span class="text-muted-foreground">
              {{ count }} ({{ ((count / total) * 100).toFixed(1) }}%)
            </span>
          </div>
        </div>
      </div>

      <div v-else class="py-6 text-center">
        <p class="text-sm text-muted-foreground">
          Ingen statistik tillgänglig.
        </p>
      </div>

      <div
        class="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground"
      >
        <span>
          Data från
          <a
            href="https://ysektionen.se/student/tentastatistik/"
            target="_blank"
            class="text-primary hover:underline"
          >
            Y-Sektionen
          </a>
        </span>
        <DialogClose
          class="hover:text-foreground transition-colors cursor-pointer"
        >
          Stäng
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
</template>
