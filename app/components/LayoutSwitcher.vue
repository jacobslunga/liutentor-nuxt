<script setup lang="ts">
import { useLayoutStore } from "~/stores/layout";
import { useChatStore } from "~/stores/chat";

const layoutStore = useLayoutStore();
const { close } = useChatStore();
const { layoutMode } = storeToRefs(layoutStore);
const { setLayoutMode } = layoutStore;

const modes = [
  { value: "exam-with-facit" as const, label: "Tenta & Facit", icon: "split" },
  { value: "exam-only" as const, label: "Endast tenta", icon: "half" },
];

function switchLayout(val: "exam-with-facit" | "exam-only") {
  setLayoutMode(val);
  close();
}
</script>

<template>
  <div class="inline-flex items-center gap-1">
    <TooltipProvider v-for="mode in modes" :key="mode.value" :delay-duration="0">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon"
            class="size-7 rounded-md text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-foreground [&_svg]:size-4"
            :class="layoutMode === mode.value && 'text-foreground'" :aria-label="mode.label"
            @click="switchLayout(mode.value)">
            <LucideColumns2 v-if="mode.icon === 'split'" />
            <LucidePanelRight v-else />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{{ mode.label }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>
