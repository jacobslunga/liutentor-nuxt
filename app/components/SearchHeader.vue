<template>
  <header class="relative w-full bg-default pt-[env(safe-area-inset-top,0px)]">
    <div class="relative flex min-h-16 w-full flex-wrap items-center justify-between gap-y-4 px-4 py-3 md:px-10 lg:px-20 xl:flex-nowrap">
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="size-10" />
        <span class="hidden font-logo text-xl font-medium tracking-tighter xl:inline">LiU Tentor</span>
      </NuxtLink>

      <div class="shrink-0">
        <AuthActions show-settings />
      </div>
    </div>

    <div class="mx-auto hidden w-full max-w-3xl px-4 pb-3 md:block md:px-8 lg:px-4 xl:pointer-events-none xl:absolute xl:inset-x-0 xl:top-1/2 xl:-translate-y-1/2 xl:pb-0">
      <CourseSearchDropdown size="lg" class="pointer-events-auto w-full max-w-md" />
    </div>
  </header>
</template>
