<script setup lang="ts">
const user = useSupabaseUser();
</script>
<template>
  <header class="sticky top-0 z-50 w-full">
    <div
      class="absolute inset-0 bg-background/80 backdrop-blur-xl -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"
    />
    <div
      class="container h-14 max-w-full flex items-center px-4 md:px-10 lg:px-20 relative z-10"
    >
      <NuxtLink
        to="/"
        class="absolute left-4 md:left-10 lg:left-20 flex items-center hover:opacity-80 transition-opacity gap-2 shrink-0"
        aria-label="LiU Tentor"
      >
        <LogoIcon class="w-10 h-10" />
        <h1
          class="text-xl hidden lg:flex font-normal font-logo tracking-tighter"
        >
          LiU Tentor
        </h1>
      </NuxtLink>

      <div class="w-full flex justify-center">
        <div class="w-full max-w-md hidden md:flex">
          <div
            class="w-full border border-foreground/20 hover:border-foreground/40 bg-background flex items-center rounded-full transition-all duration-200"
          >
            <CourseSearchDropdown size="md" class="w-full" />
          </div>
        </div>
      </div>

      <div class="absolute right-4 md:right-10 lg:right-20 flex items-center gap-2">
        <template v-if="user">
          <SettingsDialog />
          <UserDropdown />
        </template>
        <template v-else>
          <SettingsDialog />
          <Button size="sm" variant="secondary" as-child>
            <NuxtLink to="/logga-in">Logga in</NuxtLink>
          </Button>
          <Button size="sm" variant="ghost" as-child>
            <NuxtLink to="/skapa-konto">Skapa konto</NuxtLink>
          </Button>
        </template>
      </div>
    </div>
  </header>
</template>
