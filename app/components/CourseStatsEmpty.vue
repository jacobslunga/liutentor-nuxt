<script setup lang="ts">

defineProps<{
  title: string;
  body: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default/60 px-6 py-12 text-center">
    <div class="flex size-10 items-center justify-center rounded-full bg-muted/60">
      <UIcon name="i-lucide-chart-column" class="size-5 text-muted" />
    </div>
    <div>
      <p class="text-sm font-medium text-highlighted">{{ title }}</p>
      <p class="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
        {{ body }}
      </p>
    </div>
  </div>
</template>
