<template>
  <div class="pointer-events-none relative isolate flex h-10 items-center justify-between gap-2 px-2">
    <!-- Toningen är högre än raden med kontroller och sticker ut under den:
         överst är den solid så att titeln och knapparna alltid har en lugn yta
         bakom sig, sedan tonar den ut så att meddelandena löses upp när de
         rullar in under headern i stället för att skäras av mot en kant. -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-16 bg-linear-to-b from-background from-45% to-transparent" />
    <div class="pointer-events-auto flex min-w-0 flex-1 items-center gap-1.5">
      <Button variant="ghost" size="icon-sm" class="shrink-0" aria-label="Stäng chatten" @click="emit('close')">
        <LucideChevronRight />
      </Button>
      <p class="min-w-0 truncate overflow-hidden text-xs font-normal text-muted-foreground">
        {{ displayTitle }}
      </p>
    </div>
    <div class="pointer-events-auto flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Ny chatt" @click="emit('newChat')">
        <LucidePlus class="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Historik" @click="emit('openHistory')">
        <LucidePanelRight class="size-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const LEGACY_TITLE_LIMITS = new Set([50, 80]);

const props = defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
}>();
const displayTitle = computed(() => {
  const title = props.title?.trim() || "Ny chatt";

  // Older conversation titles were cut at these lengths without an ellipsis.
  if (LEGACY_TITLE_LIMITS.has(title.length) && !title.endsWith("…")) {
    return `${title}…`;
  }

  return title;
});
const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
}>();
</script>
