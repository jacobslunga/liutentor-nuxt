<script setup lang="ts">
const { hideFooter, isExamMode } = useDefaultAppShell();
</script>

<template>
  <div class="flex flex-col max-w-full min-h-dvh bg-default">
    <main class="grow">
      <slot />
    </main>
    <AppFooter v-if="!hideFooter && !isExamMode" />
  </div>
</template>
