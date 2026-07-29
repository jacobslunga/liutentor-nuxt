<script setup lang="ts">
/**
 * Editorial masthead shared by every info page: a small label, a large serif
 * headline and an optional lead paragraph, over a full-bleed hairline.
 */
defineProps<{
  eyebrow: string;
  title: string;
  lead?: string;
  meta?: string;
}>();
</script>

<template>
  <header class="border-b">
    <div class="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
      <p class="font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
        {{ eyebrow }}
      </p>

      <!-- font-serif, not font-logo: the GT Super face ships without Swedish
           diacritics and silently renders "börja" as "borja". -->
      <h1
        class="mt-5 max-w-3xl font-serif text-[2.25rem] font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl"
      >
        {{ title }}
      </h1>

      <p
        v-if="lead"
        class="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {{ lead }}
      </p>

      <p v-if="meta" class="mt-8 font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground/70">
        {{ meta }}
      </p>

      <slot />
    </div>
  </header>
</template>
