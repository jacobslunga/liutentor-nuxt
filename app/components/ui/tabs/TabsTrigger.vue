<script setup lang="ts">
import type { TabsTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { TabsTrigger, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger data-slot="tabs-trigger" :class="cn(
    `data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:font-semibold dark:data-[state=active]:bg-foreground/15 dark:data-[state=active]:text-foreground data-[state=inactive]:hover:bg-foreground/5 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground dark:text-muted-foreground inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color] focus-visible:ring-3 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
    props.class,
  )" v-bind="forwardedProps">
    <slot />
  </TabsTrigger>
</template>
