<script setup lang="ts">

</script>

<template>
  <div class="flex w-full flex-col gap-12" role="status" aria-busy="true">
    <span class="sr-only">Laddar statistik …</span>

    <section class="flex flex-col gap-5">
      <div class="flex flex-col gap-2.5" aria-hidden="true">
        <div class="skeleton-line h-2.5 w-32 rounded-full" />
        <div class="skeleton-line h-3 w-52 rounded-full" />
      </div>
      <CourseStatsLoading class="h-[300px]" />
    </section>

    <section class="flex flex-col gap-5">
      <div class="flex flex-col gap-2.5" aria-hidden="true">
        <div class="skeleton-line h-2.5 w-28 rounded-full" />
        <div class="skeleton-line h-3 w-60 rounded-full" />
      </div>
      <CourseStatsLoading variant="distribution" />
    </section>
  </div>
</template>

<style scoped>
.skeleton-line {
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
  .skeleton-line {
    animation: none;
    opacity: 0.6;
  }
}
</style>
