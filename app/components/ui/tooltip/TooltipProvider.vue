<script setup lang="ts">
import type { TooltipProviderProps } from "reka-ui";
import { TooltipProvider } from "reka-ui";

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  // Long enough that tooltips don't fire on incidental hover, short enough to
  // feel responsive when you're actually asking for one.
  delayDuration: 700,
  // Once one tooltip has shown, moving to a neighbouring trigger within this
  // window skips the delay — so scanning a toolbar doesn't stutter.
  skipDelayDuration: 300,
});
</script>

<template>
  <TooltipProvider v-bind="props">
    <slot />
  </TooltipProvider>
</template>
