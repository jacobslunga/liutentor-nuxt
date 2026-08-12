<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";

const { open: openUploadModal } = useUploadModal();
const { y } = useWindowScroll();

const scrolled = computed(() => y.value > 8);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <header class="sticky top-0 z-30 h-14 shrink-0 border-b bg-background transition-colors duration-200 ease-spring"
      :class="scrolled ? 'border-border' : 'border-transparent'">
      <div class="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <NuxtLink to="/" class="flex items-center gap-2 transition-opacity duration-150 ease-spring hover:opacity-70">
          <LogoIcon class="size-6 text-primary" />
          <span class="font-logo text-lg font-medium tracking-tighter">LiU Tentor</span>
        </NuxtLink>

        <Button variant="outline" size="sm" @click="openUploadModal()">
          <LucideUpload class="size-3.5" />
          <span class="hidden sm:inline">Ladda upp tenta</span>
          <span class="sm:hidden">Ladda upp</span>
        </Button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
