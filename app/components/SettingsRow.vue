<script setup lang="ts">

withDefaults(
  defineProps<{
    label: string;
    description?: string;
    stacked?: boolean;
  }>(),
  { stacked: false },
);
</script>

<template>
  <div
    class="border-b border-border/60 py-5 last:border-b-0"
    :class="stacked ? 'space-y-4' : 'flex items-start justify-between gap-8'"
  >
    <div class="min-w-0 space-y-1">
      <p class="text-sm font-medium text-foreground">{{ label }}</p>
      <p v-if="description" class="max-w-md text-sm leading-relaxed text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <div :class="stacked ? '' : 'shrink-0 pt-0.5'">
      <slot />
    </div>
  </div>
</template>
