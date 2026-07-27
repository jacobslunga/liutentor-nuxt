<script setup lang="ts">
import type { TabsTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { TabsTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    :class="
      cn(
        'relative z-10 cursor-pointer text-muted-foreground/75 hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-200 ease-spring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </TabsTrigger>
</template>
