<template>
  <div
    class="pointer-events-none relative isolate flex h-10 items-center justify-between gap-2 px-2"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-16 bg-linear-to-b from-background from-45% to-transparent"
    />
    <div class="pointer-events-auto flex min-w-0 flex-1 items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon-xs"
        class="shrink-0"
        aria-label="Stäng chatten"
        @click="emit('close')"
      >
        <Icon name="octicon:chevron-right-16" />
      </Button>
    </div>
    <div class="pointer-events-auto flex shrink-0 items-center gap-1">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Ny chatt"
            @click="emit('newChat')"
          >
            <Icon name="octicon:plus-16" class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ny chatt</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Historik"
            @click="emit('openHistory')"
          >
            <Icon name="octicon:sidebar-expand-16" class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Historik</TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
}>();
</script>
