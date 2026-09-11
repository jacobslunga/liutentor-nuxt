<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const model = defineModel<string>({ required: true });

const tabs: TabsItem[] = [
  { value: "exams", label: "Tentor", icon: "i-lucide-file-text" },
  { value: "stats", label: "Statistik", icon: "i-lucide-chart-line" },
  { value: "quiz", label: "Quiz", icon: "i-lucide-layers" },
];
</script>

<template>
  <div
    class="sticky top-12 z-30 flex flex-col gap-3 border-b border-default/60 bg-default pt-2 pb-2.5 sm:flex-row sm:items-center sm:justify-between md:top-0 dark:border-default/60">
    <div class="flex flex-wrap items-center gap-2">
      <!-- Panelerna ligger kvar hos sidan bakom en egen v-if, så listan
           renderas utan innehållsytor. -->
      <UTabs color="neutral" v-model="model" :items="tabs" :content="false" />

      <slot name="controls" />
    </div>

    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
