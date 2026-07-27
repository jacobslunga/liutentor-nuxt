<script setup lang="ts">
import type { TabsIndicatorProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { TabsIndicator, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  TabsIndicatorProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsIndicator
    data-slot="tabs-indicator"
    v-bind="forwardedProps"
    :class="
      cn(
        'absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-background border border-border transition-all duration-200 ease-spring dark:bg-accent dark:border-border/80 h-[var(--reka-tabs-indicator-thickness)] w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] pointer-events-none z-0',
        props.class,
      )
    "
  >
    <slot />
  </TabsIndicator>
</template>
