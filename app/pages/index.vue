<script setup lang="ts">
import { ref } from "vue";

useSeoMeta({
  title: "Sök tentor",
  description: "Hitta gamla tentor från Linköpings Universitet",
});

const focusInput = ref(false);
const { open: openUploadModal } = useUploadModal();
</script>

<template>
  <div class="relative flex flex-col items-center justify-start w-full min-h-screen p-4 pt-[20vh] bg-default">
    <div class="absolute top-5 left-5">
      <DailyCourseButton />
    </div>

    <div class="flex flex-row items-center justify-center gap-2 absolute top-5 right-5">
      <AuthActions />
    </div>

    <div class="w-full max-w-150 flex flex-col items-center gap-6 mb-20">
      <div class="flex flex-row items-center justify-center space-x-2">
        <LogoIcon class="w-12 h-12 md:w-14 md:h-14 lg:w-24 lg:h-24" />
        <h1 class="text-4xl lg:text-5xl font-medium font-logo tracking-tighter">
          LiU Tentor
        </h1>
      </div>

      <div class="relative w-full">
        <div
          class="w-full border border-inverted/20 bg-default flex flex-row items-center justify-center rounded-full transition-colors duration-200 ease-spring text-sm text-highlighted/80 outline-none"
          :class="focusInput
            ? 'border-primary ring-1 ring-primary'
            : 'hover:border-inverted/40'
            ">
          <MainInput v-model:focusInput="focusInput" />
        </div>
      </div>

      <RecentSearches />

      <UButton color="neutral" variant="outline" @click="openUploadModal()">
        <UIcon name="i-lucide-upload" />
        Ladda upp fler tentor
      </UButton>
    </div>
  </div>
</template>
