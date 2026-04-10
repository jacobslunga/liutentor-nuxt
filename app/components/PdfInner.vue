<script setup lang="ts">
import { useSelectionCapability } from "@embedpdf/plugin-selection/vue";

const { provides: selectionCapability } = useSelectionCapability();

const hasActiveSelection = ref(false);
let selectionCleanup: (() => void) | null = null;

watch(
  selectionCapability,
  (cap) => {
    if (selectionCleanup) selectionCleanup();
    if (cap) {
      selectionCleanup = cap.onSelectionChange((sel) => {
        hasActiveSelection.value = !!sel;
      });
    }
  },
  { immediate: true },
);

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "c") {
    if (hasActiveSelection.value && selectionCapability.value) {
      e.preventDefault();
      selectionCapability.value.copyToClipboard();
    }
  }
};

onMounted(() => window.addEventListener("keydown", handleKeyDown));
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  if (selectionCleanup) selectionCleanup();
});
</script>

<template>
  <slot />
</template>
