<script setup lang="ts"></script>
<template>
  <header class="w-full bg-background">
    <div
      class="container h-16 max-w-full flex items-center justify-center px-4 md:px-10 lg:px-20 relative"
    >
      <NuxtLink
        to="/"
        class="absolute left-4 md:left-10 lg:left-20 flex items-center hover:opacity-80 transition-opacity gap-2 shrink-0"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="w-10 h-10" />
        <h1
          class="text-xl hidden xl:flex font-medium font-logo tracking-tighter"
        >
          LiU Tentor
        </h1>
      </NuxtLink>

      <div
        class="container max-w-3xl px-4 hidden md:flex flex-row items-start justify-start"
      >
        <CourseSearchDropdown size="md" class="min-w-md" />
      </div>

      <div
        class="absolute right-4 md:right-10 lg:right-20 flex items-center gap-2"
      >
        <AuthActions show-settings />
      </div>
    </div>
  </header>
</template>
