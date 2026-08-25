<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "bars" | "distribution";
  }>(),
  { variant: "bars" },
);

// Godtyckliga höjder — skelettet ska antyda en stapelgraf, inte föregripa datan.
const BAR_HEIGHTS = [46, 68, 34, 82, 55, 71, 40, 63, 88, 51, 37, 74, 59, 45];
const ROWS = [0, 1, 2, 3, 4];
</script>

<template>
  <div class="w-full" role="presentation" aria-hidden="true">
    <div
      v-if="variant === 'bars'"
      class="flex h-full min-h-75 w-full items-end gap-2"
    >
      <span
        v-for="(height, i) in BAR_HEIGHTS"
        :key="i"
        class="skeleton min-w-0 flex-1 rounded-md"
        :style="{ height: `${height}%`, animationDelay: `${i * 70}ms` }"
      />
    </div>

    <div
      v-else
      class="grid w-full gap-8 md:grid-cols-2 md:items-center md:gap-12"
    >
      <div class="flex flex-col gap-5 rounded-xl border border-border/60 px-4 py-4">
        <div v-for="row in ROWS" :key="row" class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-4">
            <span
              class="skeleton h-3 w-8 rounded-full"
              :style="{ animationDelay: `${row * 70}ms` }"
            />
            <span
              class="skeleton h-3 w-20 rounded-full"
              :style="{ animationDelay: `${row * 70}ms` }"
            />
          </div>
          <span
            class="skeleton block h-1 w-full rounded-full"
            :style="{ animationDelay: `${row * 70}ms` }"
          />
        </div>
      </div>

      <div class="mx-auto flex w-full max-w-xs items-center justify-center py-4">
        <div class="skeleton relative size-40 rounded-full">
          <div class="absolute inset-[26px] rounded-full bg-background" />
        </div>
      </div>
    </div>
  </div>
</template>
