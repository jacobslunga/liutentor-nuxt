<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";

const { font } = useFontPreference();

useHead({
  bodyAttrs: {
    class: computed(() => (font.value === "system" ? "font-system" : "")),
  },
});
</script>
