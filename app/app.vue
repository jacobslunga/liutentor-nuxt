<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
    <ExamUploadDialog />
  </div>
</template>

<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";

// Keep the tab icon in sync with the active colour mode.
//
// A single SVG with an internal `prefers-color-scheme` media query does not
// work here for two reasons:
//   1. Browsers rasterise the favicon once and cache it, so the query is not
//      re-evaluated when the theme changes — the icon lags until a reload.
//   2. `prefers-color-scheme` follows the OS, but @nuxtjs/color-mode lets the
//      user override the theme in-app, so the two can disagree indefinitely.
// Pointing at two separate files and switching the href sidesteps both.
const colorMode = useColorMode();

useHead({
  link: [
    {
      key: "favicon",
      rel: "icon",
      type: "image/svg+xml",
      href: () =>
        colorMode.value === "dark"
          ? "/favicon-dark.svg"
          : "/favicon-light.svg",
    },
  ],
});
</script>
