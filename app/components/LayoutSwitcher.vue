<script setup lang="ts">
import { useLayoutStore } from "~/stores/layout";
import { useChatStore } from "~/stores/chat";

const layoutStore = useLayoutStore();
const { close } = useChatStore();

const { layoutMode } = storeToRefs(layoutStore);

const { isVisible, isHovering } = useHeaderVisibility();

function switchLayout(val: string | number) {
  if (val !== "exam-with-facit" && val !== "exam-only") return;
  layoutStore.setLayoutMode(val);
  close();
}
</script>

<template>
  <div
    class="fixed bottom-10 left-5 z-40 hidden md:flex transition-all duration-300 ease-spring"
    :class="
      isVisible || isHovering
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 translate-y-2 pointer-events-none'
    "
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <Tabs
      :model-value="layoutMode"
      @update:model-value="switchLayout"
    >
      <TabsList class="backdrop-blur-sm bg-muted/80">
        <TabsTrigger value="exam-with-facit" class="text-xs">
          <LucideColumns2 class="size-3.5" />
        </TabsTrigger>
        <TabsTrigger value="exam-only" class="text-xs">
          <LucidePanelRight class="size-3.5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>
