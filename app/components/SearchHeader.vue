<script setup lang="ts"></script>
<template>
  <header class="w-full border-b border-border bg-background">
    <div
      class="container h-16 max-w-full flex items-center px-4 md:px-10 lg:px-20 relative"
    >
      <NuxtLink
        to="/"
        class="absolute left-4 md:left-10 lg:left-20 flex items-center hover:opacity-80 transition-opacity gap-2 shrink-0"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="w-10 h-10" />
        <h1
          class="text-xl hidden lg:flex font-medium font-logo tracking-tighter"
        >
          LiU Tentor
        </h1>
      </NuxtLink>

      <div class="w-full flex justify-center">
        <div class="w-full max-w-md hidden md:flex">
          <CourseSearchDropdown size="md" class="w-full" />
        </div>
      </div>

      <div
        class="absolute right-4 md:right-10 lg:right-20 flex items-center gap-2"
      >
        <AuthActions show-settings />
      </div>
    </div>
  </header>
</template>
