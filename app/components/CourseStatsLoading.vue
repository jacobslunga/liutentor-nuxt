<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "bars" | "distribution";
  }>(),
  { variant: "bars" },
);

const chartGradientId = `${useId()}-loading-chart`;
const Y_TICKS = [100, 75, 50, 25, 0];
const X_TICKS = [0, 1, 2, 3, 4, 5];
const ROWS = [0, 1, 2, 3, 4];
</script>

<template>
  <div class="w-full" role="presentation" aria-hidden="true">
    <div v-if="variant === 'bars'" class="skeleton-chart relative h-full min-h-75 pb-7 pl-12 pt-4">
      <div class="absolute bottom-7 left-0 top-4 w-10">
        <span v-for="(tick, i) in Y_TICKS" :key="tick"
          class="absolute right-1 -translate-y-1/2 text-[11px] font-medium text-muted-foreground/55"
          :style="{ top: `${i * 25}%` }">
          {{ tick }}%
        </span>
      </div>

      <div class="relative h-full w-full overflow-hidden">
        <div v-for="(_, i) in Y_TICKS" :key="i" class="absolute inset-x-0 border-t border-border/55"
          :style="{ top: `${i * 25}%` }" />

        <svg class="absolute inset-0 size-full" viewBox="0 0 800 260" preserveAspectRatio="none">
          <defs>
            <linearGradient :id="chartGradientId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--muted)" stop-opacity="0.9" />
              <stop offset="100%" stop-color="var(--muted)" stop-opacity="0.18" />
            </linearGradient>
          </defs>
          <path
            d="M0 48 C80 42 135 58 205 74 C275 91 315 66 375 92 C430 116 445 202 505 190 C555 180 560 78 620 92 C675 104 685 184 735 166 C765 155 777 130 800 142 L800 260 L0 260 Z"
            :fill="`url(#${chartGradientId})`"
          />
          <path
            d="M0 48 C80 42 135 58 205 74 C275 91 315 66 375 92 C430 116 445 202 505 190 C555 180 560 78 620 92 C675 104 685 184 735 166 C765 155 777 130 800 142"
            fill="none" stroke="var(--muted-foreground)" stroke-opacity="0.28" stroke-width="3"
            vector-effect="non-scaling-stroke"
          />
          <line x1="0" y1="138" x2="800" y2="138" stroke="var(--muted-foreground)" stroke-opacity="0.22"
            stroke-width="1.5" stroke-dasharray="7 6" vector-effect="non-scaling-stroke" />
        </svg>

        <div
          class="skeleton-block absolute left-2 top-[53%] h-5 w-18 -translate-y-1/2 rounded-full border border-border/50"
        />
      </div>

      <div class="absolute bottom-0 left-12 right-0 flex justify-between px-2">
        <span v-for="tick in X_TICKS" :key="tick" class="skeleton-block h-2.5 w-8 rounded-full"
          :style="{ animationDelay: `${tick * 60}ms` }" />
      </div>
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
