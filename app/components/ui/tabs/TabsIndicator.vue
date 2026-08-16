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
  <TabsIndicator data-slot="tabs-indicator" v-bind="forwardedProps" :style="{
    width: 'var(--reka-tabs-indicator-size)',
    transform: 'translateX(var(--reka-tabs-indicator-position))',
  }" :class="cn(
    'pointer-events-none absolute inset-y-[3px] left-0 z-0 rounded-lg border border-border/50 bg-background shadow-sm transition-transform duration-200 ease-out dark:border-white/10 dark:bg-white/10 dark:shadow-black/40',
    props.class,
  )
    ">
    <slot />
  </TabsIndicator>
</template>
