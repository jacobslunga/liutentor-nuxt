<script setup lang="ts">
/**
 * Holds the chart's slot while the client-only bundle loads. A spinner rather
 * than a skeleton block: the charts render in one pass once the module lands,
 * so there is no partial shape to stand in for.
 */
</script>

<template>
  <div class="flex w-full items-center justify-center">
    <LucideLoader2 class="size-5 animate-spin text-muted-foreground" />
  </div>
</template>
