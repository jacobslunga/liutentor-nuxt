<script setup lang="ts"></script>

<template>
  <header class="sticky top-0 z-50 w-full">
    <div
      class="absolute inset-0 bg-background/80 backdrop-blur-xl -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"
    />
    <div
      class="container h-14 max-w-full flex items-center justify-between px-4 md:px-10 lg:px-20 relative z-10"
    >
      <NuxtLink
        to="/"
        class="flex items-center hover:opacity-80 transition-opacity mr-4 shrink-0"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="w-7 h-7 md:w-10 md:h-10" />
      </NuxtLink>

      <div class="flex-1 max-w-md mx-auto">
        <div
          class="w-full border border-foreground/20 hover:border-foreground/40 bg-background flex items-center rounded-full transition-all duration-200"
        >
          <CourseSearchDropdown size="md" class="w-full" />
        </div>
      </div>

      <div class="flex items-center justify-end ml-4 shrink-0">
        <SettingsDialog />
      </div>
    </div>
  </header>
</template>
