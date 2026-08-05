<script setup lang="ts">
/**
 * Holds a chart's slot while its client-only bundle loads. Shaped like the
 * chart that replaces it rather than a spinner: the section keeps its height,
 * so nothing below it jumps when the module lands.
 */
withDefaults(
  defineProps<{
    /** `bars` stands in for the pass-rate chart, `distribution` for the grades. */
    variant?: "bars" | "distribution";
  }>(),
  { variant: "bars" },
);

// Fixed rather than random: the placeholder has to render identically on the
// server pass and the client one.
const BAR_HEIGHTS = [46, 28, 62, 40, 71, 35, 55, 44, 78, 33, 58, 66, 39, 50];
const ROWS = [0, 1, 2, 3, 4];
</script>

<template>
  <div class="w-full" role="presentation" aria-hidden="true">
    <div v-if="variant === 'bars'" class="flex h-full w-full items-end gap-1.5 sm:gap-2">
      <div
        v-for="(height, i) in BAR_HEIGHTS"
        :key="i"
        class="skeleton-block flex-1 rounded-t-sm"
        :style="{ height: `${height}%`, animationDelay: `${i * 50}ms` }"
      />
    </div>

    <div v-else class="grid w-full gap-8 md:grid-cols-2 md:items-center md:gap-12">
      <div class="flex flex-col gap-5 rounded-xl border border-border/60 px-4 py-4">
        <div
          v-for="row in ROWS"
          :key="row"
          class="flex flex-col gap-2"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="skeleton-block h-3 w-8 rounded-full" :style="{ animationDelay: `${row * 60}ms` }" />
            <div class="skeleton-block h-3 w-20 rounded-full" :style="{ animationDelay: `${row * 60}ms` }" />
          </div>
          <div class="skeleton-block h-1 w-full rounded-full" :style="{ animationDelay: `${row * 60}ms` }" />
        </div>
      </div>

      <div class="mx-auto flex w-full max-w-xs items-center justify-center py-4">
        <!-- A ring, not a disc: the donut it stands in for is hollow. -->
        <div class="skeleton-block relative size-40 rounded-full">
          <div class="absolute inset-[26px] rounded-full bg-background" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-block {
  background: var(--muted);
  animation: skeleton-pulse 1.6s var(--ease-spring) infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
    opacity: 0.6;
  }
}
</style>
