<script setup lang="ts">
import { VisDonut, VisSingleContainer, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";
import type { GradeEntry } from "~/composables/useCourseStats";

const props = defineProps<{
  grades: GradeEntry[];
  total: number;
}>();

const tokens = useChartTokens([
  "grade-fail",
  "grade-high",
  "grade-low",
  "grade-mid",
] as const);

const color = (d: GradeEntry) => tokens.value[d.token];
const value = (d: GradeEntry) => d.value;

const totalLabel = computed(() => props.total.toLocaleString("sv-SE"));

const triggers = {
  [Donut.selectors.segment]: (d: { data: GradeEntry }) => `
    <div class="px-3 py-2">
      <div class="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Betyg ${d.data.key}
      </div>
      <div class="mt-1 text-sm text-foreground">
        ${d.data.value.toLocaleString("sv-SE")} · ${d.data.pct.toFixed(1)}%
      </div>
    </div>
  `,
};
</script>

<template>
  <div class="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
    <!-- The list is the table view, not decoration: a donut can't be read for
         close values, so every number it encodes is also here in full. -->
    <ol class="divide-y divide-border/60 rounded-xl border border-border/60">
      <li
        v-for="grade in grades"
        :key="grade.key"
        class="flex flex-col gap-2 px-4 py-3"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ background: `var(--${grade.token})` }"
            />
            <span class="text-sm font-medium text-foreground">
              {{ grade.key }}
            </span>
          </div>
          <div class="flex items-baseline gap-3 tabular-nums">
            <span class="text-xs text-muted-foreground">
              {{ grade.value.toLocaleString("sv-SE") }}
            </span>
            <span class="w-14 text-right text-sm font-medium text-foreground">
              {{ grade.pct.toFixed(1) }}%
            </span>
          </div>
        </div>
        <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full"
            :style="{
              width: `${grade.pct}%`,
              background: `var(--${grade.token})`,
            }"
          />
        </div>
      </li>
    </ol>

    <div class="vis-chart grade-donut mx-auto w-full max-w-xs">
      <VisSingleContainer :data="grades" :height="260">
        <VisDonut
          :value="value"
          :color="color"
          :arc-width="26"
          :corner-radius="4"
          :pad-angle="0.02"
          :show-background="false"
          :central-label="totalLabel"
          central-sub-label="studenter"
        />
        <VisTooltip :triggers="triggers" />
      </VisSingleContainer>
    </div>
  </div>
</template>

<style scoped>
.grade-donut {
  --vis-donut-central-label-font-size: 26px;
  --vis-donut-central-label-font-weight: 600;
  --vis-donut-central-sub-label-font-size: 11px;
}
</style>
