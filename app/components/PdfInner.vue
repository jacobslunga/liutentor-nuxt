<script setup lang="ts">
import { useSelectionCapability } from "@embedpdf/plugin-selection/vue";

const { provides: selectionCapability } = useSelectionCapability();

const hasActiveSelection = ref(false);
let selectionCleanup: (() => void) | null = null;

function normalizePdfText(text: string) {
  return text
    .replace(/[¨\u0308]([aAoO])/gu, "$1\u0308")
    .replace(/([aAoO])¨/gu, "$1\u0308")
    .replace(/[˚\u030A]([aA])/gu, "$1\u030A")
    .replace(/([aA])˚/gu, "$1\u030A")
    .normalize("NFC");
}

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

const handleKeyDown = async (e: KeyboardEvent) => {
  const capability = selectionCapability.value;
  if (
    !(e.metaKey || e.ctrlKey) ||
    e.key.toLowerCase() !== "c" ||
    !hasActiveSelection.value ||
    !capability
  ) {
    return;
  }

  e.preventDefault();

  try {
    const pages = await capability.getSelectedText().toPromise();
    await navigator.clipboard.writeText(normalizePdfText(pages.join("\n")));
  } catch {
    capability.copyToClipboard();
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
