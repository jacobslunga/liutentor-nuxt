<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const model = defineModel<string>({ required: true });

const tabs: TabsItem[] = [
  { value: "exams", label: "Tentor", icon: "i-openai-file-text" },
  { value: "stats", label: "Statistik", icon: "i-openai-chart-line" },
  { value: "quiz", label: "Quiz", icon: "i-openai-stack-2" },
];
</script>

<template>
  <div
    class="course-tabs-bar sticky top-12 z-30 flex flex-col gap-3 bg-default/90 dark:bg-default/90 pt-2 pb-2.5 backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:top-0">
    <div class="flex flex-wrap items-center gap-2">
      <UTabs color="neutral" v-model="model" :items="tabs" :content="false" />

    </div>

    <div class="flex items-center gap-2">
      <slot name="controls" />
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.course-tabs-bar::after {
  content: "";
  position: absolute;
  inset: 100% 0 auto;
  height: 20px;
  pointer-events: none;
  background: color-mix(in srgb, var(--ui-bg) 100%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent);
  mask-image: linear-gradient(to bottom, black, transparent);
}
</style>
