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
        'absolute inset-y-0 left-0 -z-10 bg-primary/10 transition-all duration-200 ease-spring dark:bg-primary/15 w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] pointer-events-none',
        props.class,
      )
    "
  >
    <slot />
  </TabsIndicator>
</template>
