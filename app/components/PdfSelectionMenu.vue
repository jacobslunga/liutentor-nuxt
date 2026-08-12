<script setup lang="ts">
import { useSelectionCapability } from "@embedpdf/plugin-selection/vue";

const props = defineProps<{
  documentId: string;

  above: boolean;
}>();

const emit = defineEmits<{ explain: [text: string] }>();

const { provides: selection } = useSelectionCapability();

const MAX_SELECTION_LENGTH = 4000;

const isResolving = ref(false);

async function explain() {
  const capability = selection.value;
  if (!capability || isResolving.value) return;

  isResolving.value = true;
  try {

    const pages = await capability.getSelectedText(props.documentId).toPromise();
    const text = pages.join("\n").trim();
    if (!text) return;

    emit("explain", text.slice(0, MAX_SELECTION_LENGTH));
    capability.clear(props.documentId);
  } catch {

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

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-spring);
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}
</style>
