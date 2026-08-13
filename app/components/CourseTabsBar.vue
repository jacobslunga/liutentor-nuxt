<template>
  <div
    class="sticky top-12 z-40 flex flex-col gap-3 border-b border-border/60 bg-background pt-2 pb-2.5 sm:flex-row sm:items-center sm:justify-between md:top-0 dark:border-border/60"
  >
    <TabsList>
      <TabsTrigger value="exams" class="h-full font-medium text-xs gap-2">
        <LucideScrollText class="w-4 h-4" />
        Tentor
      </TabsTrigger>
      <TabsTrigger value="stats" class="h-full font-medium text-xs gap-2">
        <LucideChartSpline class="w-4 h-4" />
        Statistik
      </TabsTrigger>
      <TabsTrigger value="quiz" class="h-full font-medium text-xs gap-2">
        <LucideLayers class="w-4 h-4" />
        Quiz
      </TabsTrigger>
    </TabsList>

    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
