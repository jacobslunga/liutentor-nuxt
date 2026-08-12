<script setup lang="ts">

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
      <p class="text-sm font-medium text-muted-foreground">
        {{ eyebrow }}
      </p>

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

      <p v-if="meta" class="mt-8 text-sm text-muted-foreground/70">
        {{ meta }}
      </p>

      <slot />
    </div>
  </header>
</template>
