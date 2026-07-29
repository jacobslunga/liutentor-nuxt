<script setup lang="ts">
/** Closing note on a long-form page — a rule, a short paragraph, one action. */
defineProps<{
  title: string;
  body: string;
}>();
</script>

<template>
  <div class="grid gap-x-12 gap-y-5 border-t py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-20">
    <h2 class="text-lg font-medium text-foreground">
      {{ title }}
    </h2>
    <div class="max-w-2xl">
      <p class="text-[0.9375rem] leading-[1.75] text-foreground/75">
        {{ body }}
      </p>
      <div class="mt-6">
        <slot />
      </div>
    </div>
  </div>
</template>
