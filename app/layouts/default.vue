<script setup lang="ts">
const route = useRoute();

const hideFooter = computed(
  () =>
    /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(route.path) ||
    /^\/quiz\/[^/]+$/.test(route.path),
);
</script>

<template>
  <div class="flex flex-col max-w-full min-h-screen bg-background">
    <main class="grow">
      <slot />
    </main>
    <AppFooter v-if="!hideFooter" />
  </div>
</template>
