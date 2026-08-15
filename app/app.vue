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
import "@fontsource-variable/platypi/wght.css";
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";

const colorMode = useColorMode();

useHead({
  link: [
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
