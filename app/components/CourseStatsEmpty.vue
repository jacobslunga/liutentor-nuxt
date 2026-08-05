<script setup lang="ts">
/**
 * Stands in for a chart that has no data behind it. Saying so beats rendering
 * an empty axis, which reads as a loading state that never resolves.
 */
defineProps<{
  title: string;
  body: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
    <div class="flex size-10 items-center justify-center rounded-full bg-muted/60">
      <LucideChartColumn class="size-5 text-muted-foreground" />
    </div>
    <div>
      <p class="text-sm font-medium text-foreground">{{ title }}</p>
      <p class="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {{ body }}
      </p>
    </div>
  </div>
</template>
