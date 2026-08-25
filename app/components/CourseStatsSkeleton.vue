<template>
  <div class="flex w-full flex-col gap-12" role="status" aria-busy="true">
    <span class="sr-only">Laddar statistik …</span>

    <section class="flex flex-col gap-5">
      <div class="flex flex-col gap-2.5" aria-hidden="true">
        <div class="skeleton h-2.5 w-32 rounded-full" />
        <div class="skeleton h-3 w-52 rounded-full" />
      </div>
      <CourseStatsLoading class="h-[300px]" />
    </section>

    <section class="flex flex-col gap-5">
      <div class="flex flex-col gap-2.5" aria-hidden="true">
        <div class="skeleton h-2.5 w-28 rounded-full" />
        <div class="skeleton h-3 w-60 rounded-full" />
      </div>
      <CourseStatsLoading variant="distribution" />
    </section>
  </div>
</template>
