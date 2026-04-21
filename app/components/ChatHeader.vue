<template>
  <div
    class="shrink-0 relative flex items-center justify-between px-3 py-2 z-90 overflow-visible"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -bottom-6 -z-10 bg-linear-to-b from-background/85 via-background/55 to-transparent"
    ></div>

    <div class="flex items-center gap-2 min-w-0">
      <Button variant="ghost" size="icon" class="size-8" @click="emit('close')">
        <LucideChevronRight />
      </Button>
    </div>

    <p
      class="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm font-normal truncate w-[42%] sm:w-[50%] text-center"
    >
      {{ displayTitle }}
    </p>

    <div class="flex items-center gap-1">
      <TooltipProvider :delay-duration="100">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="emit('newChat')"
            >
              <LucidePlus class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Ny chatt</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider v-if="isSignedIn" :delay-duration="100">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="size-8"
              @click="emit('openHistory')"
            >
              <LucidePanelRightDashed v-if="historyOpen" class="w-4 h-4" />
              <LucidePanelRight v-else class="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" class="flex items-center gap-2">
            <kbd class="text-xs">{{ historyShortcutLabel }} + .</kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
}>();

const user = useSupabaseUser();
const isSignedIn = computed(() => !!user.value);
const isMac = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
});
const historyShortcutLabel = computed(() => (isMac.value ? "Cmd" : "Ctrl"));

const displayTitle = computed(() => props.title?.trim() || "Ny chatt");

const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
}>();
</script>
