<template>
  <div>
    <AppLoadingIndicator
      color="var(--primary)"
      :height="2"
      :throttle="80"
      :hide-delay="150"
    />
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
import logoFontUrl from "~/assets/fonts/gt-super-text-bold.woff2?url&no-inline";
import sansFontUrl from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url&no-inline";

const colorMode = useColorMode();

onMounted(() => {
  // "dim" was the old name for the softer dark palette. Keep the CSS alias
  // during migration, but persist the single canonical dark preference.
  if (colorMode.preference === "dim") {
    colorMode.preference = "dark";
  }
});

useHead({
  link: [
    // Bara latin-subseten av de två snitt som syns direkt: brödtexten och
    // logotypen.
    {
      key: "sans-font-preload",
      rel: "preload",
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
      href: sansFontUrl,
    },
    {
      key: "logo-font-preload",
      rel: "preload",
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
      href: logoFontUrl,
    },
    {
      key: "favicon",
      rel: "icon",
      type: "image/svg+xml",
      href: () =>
        ["dark", "dim"].includes(colorMode.value)
          ? "/favicon-dark.svg"
          : "/favicon-light.svg",
    },
  ],
});
</script>
