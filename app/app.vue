<template>
  <div>
    <AppLoadingIndicator color="var(--primary)" :height="2" :throttle="80" :hide-delay="150" />
    <UApp
      :tooltip="{ delayDuration: 200, ignoreNonKeyboardFocus: true }"
      :toaster="{ position: 'top-center', duration: 4000 }"
    >
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <ExamUploadDialog />
    </UApp>
  </div>
</template>

<script setup lang="ts">
import logoFontUrl from "~/assets/fonts/gt-super-text-bold.woff2?url&no-inline";

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
    // Logotypen syns i headern på varje sida och förladdas.
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
