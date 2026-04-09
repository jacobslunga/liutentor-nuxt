<script setup lang="ts">
const route = useRoute();

const isExamViewUrl = computed(() => {
  return /^\/search\/[A-Z0-9]+\/\d+$/.test(route.path);
});

const hideFooter = computed(
  () =>
    /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(route.path) ||
    /^\/quiz\/[^/]+$/.test(route.path),
);
</script>

<template>
  <div class="flex flex-col min-h-screen w-full">
    <search-header v-if="!isExamViewUrl" />
    <main class="flex grow flex-col max-w-full w-full relative">
      <slot />
    </main>
    <AppFooter v-if="!hideFooter" />
  </div>
</template>
