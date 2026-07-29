<script setup lang="ts">
import { useSelectionCapability } from "@embedpdf/plugin-selection/vue";

/**
 * The button offered over a text selection in the PDF. Must be rendered inside
 * SelectionLayer's `selection-menu` slot: the capability it reads comes from
 * the plugin registry, and the slot's wrapper is what positions it over the
 * selection at the current zoom.
 */
const props = defineProps<{
  documentId: string;
  /** The wrapper sits above the selection, so the button has to open upwards. */
  above: boolean;
}>();

const emit = defineEmits<{ explain: [text: string] }>();

const { provides: selection } = useSelectionCapability();

// Matches ChatInput's own ceiling. A drag down a whole page is far more text
// than the question needs, and the chat would reject it downstream anyway.
const MAX_SELECTION_LENGTH = 4000;

const isResolving = ref(false);

async function explain() {
  const capability = selection.value;
  if (!capability || isResolving.value) return;

  isResolving.value = true;
  try {
    // One entry per page the selection spans.
    const pages = await capability.getSelectedText(props.documentId).toPromise();
    const text = pages.join("\n").trim();
    if (!text) return;

    emit("explain", text.slice(0, MAX_SELECTION_LENGTH));
    capability.clear(props.documentId);
  } catch {
    // Page geometry not resolved yet. Leaving the selection up means the
    // button is still there to try again.
  } finally {
    isResolving.value = false;
  }
}
</script>

<template>
  <Transition name="menu-fade" appear>
    <Button size="sm" variant="outline" :disabled="isResolving"
      class="pointer-events-auto absolute left-1/2 -translate-x-1/2 whitespace-nowrap shadow-sm"
      :class="above ? 'bottom-full mb-2' : 'top-full mt-2'" @click.stop="explain">
      Förklara
      <LucideCornerUpRight class="w-3.5 h-3.5" />
    </Button>
  </Transition>
</template>

<style scoped>
/* Opacity only: the horizontal centring above is itself a transform, and
   animating one would fight the other. */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-spring);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
