<script setup lang="ts">
import serifFontUrl from "@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?url&no-inline";

defineProps<{
  eyebrow: string;
  title: string;
  lead?: string;
  meta?: string;
}>();

useHead({
  link: [
    {
      key: "serif-font-preload",
      rel: "preload",
      as: "font",
      type: "font/woff2",
      crossorigin: "anonymous",
      href: serifFontUrl,
    },
  ],
});
</script>

<template>
  <header class="border-b">
    <div class="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
      <p class="text-sm font-medium text-muted-foreground">
        {{ eyebrow }}
      </p>

      <h1
        class="mt-5 max-w-3xl font-serif text-[2.25rem] font-medium leading-[1.1] tracking-[-0.015em] text-foreground sm:text-5xl lg:text-6xl">
        {{ title }}
      </h1>

      <p v-if="lead" class="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {{ lead }}
      </p>

      <p v-if="meta" class="mt-8 text-sm text-muted-foreground/70">
        {{ meta }}
      </p>

      <slot />
    </div>
  </header>
</template>
