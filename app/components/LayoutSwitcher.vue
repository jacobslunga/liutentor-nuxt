<script setup lang="ts">
import { useLayoutStore } from "~/stores/layout";
import { useChatStore } from "~/stores/chat";

const layoutStore = useLayoutStore();
const { close } = useChatStore();

const { layoutMode } = storeToRefs(layoutStore);
const { setLayoutMode } = layoutStore;

const { isVisible, isHovering } = useHeaderVisibility();

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
  <div class="fixed bottom-10 left-5 z-40 hidden md:flex rounded-md p-1 transition-all duration-300 ease-in-out" :class="isVisible || isHovering
    ? 'opacity-100 translate-y-0 pointer-events-auto'
    : 'opacity-0 translate-y-2 pointer-events-none'
    " @mouseenter="isHovering = true" @mouseleave="isHovering = false">
    <div class="flex items-center gap-0">
      <TooltipProvider v-for="mode in modes" :key="mode.value" :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <button
              class="flex backdrop-blur-sm border items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              :class="[
                mode.value === 'exam-with-facit'
                  ? 'rounded-l-xl'
                  : 'rounded-r-xl',
                layoutMode === mode.value
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background/80 text-muted-foreground border-border hover:bg-secondary hover:text-foreground',
              ]" @click="switchLayout(mode.value)">
              <LucideColumns2 v-if="mode.icon === 'split'" class="w-5 h-5"  />
              <LucidePanelRight v-else class="w-5 h-5"  />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ mode.label }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>
