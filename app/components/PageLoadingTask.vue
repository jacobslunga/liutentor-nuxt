<script setup lang="ts">
/**
 * Declarative way to hold the page loading bar from inside a template — useful
 * where the pending state only exists as a slot prop and never reaches script
 * setup. Renders nothing.
 */
const props = defineProps<{ pending: boolean }>();

const { trackWhile } = usePageLoading();
trackWhile(() => props.pending);
</script>

<template><span /></template>
