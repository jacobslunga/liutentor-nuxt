<template>
  <div
    class="shrink-0 relative flex items-center justify-between px-3 py-2 z-90"
  >
    <div class="flex items-center gap-2 min-w-0">
      <Button variant="ghost" size="icon" class="size-8" @click="emit('close')">
        <LucideChevronRight />
      </Button>
      <div
        class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] cursor-default shrink-0"
        :class="
          hasSolution
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-muted/50 text-muted-foreground'
        "
      >
        <LucideCircleCheck v-if="hasSolution" class="w-3.5 h-3.5" />
        <LucideSquareX v-else class="w-3.5 h-3.5" />
        <span class="font-medium">Lösning</span>
      </div>
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
          <TooltipContent side="bottom">Ny chatt</TooltipContent>
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
