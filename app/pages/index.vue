<script setup lang="ts">
import { ref } from "vue";
import Button from "~/components/ui/button/Button.vue";

useSeoMeta({
  title: "Sök tentor",
  description: "Hitta gamla tentor från Linköpings Universitet",
});

const focusInput = ref(false);

const user = useSupabaseUser();
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-start w-full min-h-screen p-4 pt-[20vh] bg-background"
  >
    <div
      class="flex flex-row items-center justify-center gap-2 absolute top-5 right-5"
    >
      <template v-if="user">
        <UserDropdown />
      </template>
      <template v-else>
        <Button size="sm" variant="outline" as-child>
          <NuxtLink to="/logga-in">Logga in</NuxtLink>
        </Button>
        <Button size="sm" variant="default" as-child>
          <NuxtLink to="/skapa-konto">Skapa konto</NuxtLink>
        </Button>
      </template>
    </div>

    <div class="flex flex-col items-center space-y-2 mb-10">
      <div class="flex flex-row items-center justify-center space-x-2">
        <LogoIcon class="w-12 h-12 md:w-14 md:h-14 lg:w-24 lg:h-24" />
        <h1 class="text-4xl lg:text-5xl font-medium font-logo tracking-tighter">
          LiU Tentor
        </h1>
      </div>
    </div>

    <div class="w-full max-w-150 flex flex-col items-center space-y-6 mb-20">
      <div class="relative w-full">
        <div
          class="w-full border border-foreground/20 bg-background flex flex-row items-center justify-center rounded-full transition-all duration-200 text-sm text-foreground/80 outline-none"
          :class="
            focusInput
              ? 'border-primary ring-1 ring-primary'
              : 'hover:border-foreground/40'
          "
        >
          <MainInput v-model:focusInput="focusInput" />
        </div>
      </div>

      <RecentSearches />

      <NuxtLink to="/upload-exams">
        <Button variant="outline" size="sm">
          <LucideUpload class="w-4.5 h-4.5" />
          Ladda upp fler tentor
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
