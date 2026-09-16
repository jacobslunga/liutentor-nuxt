<template>
  <header class="w-full bg-default pt-[env(safe-area-inset-top,0px)]">
    <div class="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-8 lg:px-10">
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="size-10" />
        <span class="hidden font-logo text-xl font-medium tracking-tighter xl:inline">LiU Tentor</span>
      </NuxtLink>

      <div class="hidden min-w-0 flex-1 md:block">
        <CourseSearchDropdown size="lg" class="w-full max-w-xl" />
      </div>

      <div class="ml-auto shrink-0">
        <AuthActions show-settings />
      </div>
    </div>
  </header>
</template>
