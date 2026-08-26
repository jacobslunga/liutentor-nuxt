<script setup lang="ts">
import type { TabsListProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { TabsList } from "reka-ui";
import TabsIndicator from "./TabsIndicator.vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<
    TabsListProps & {
      class?: HTMLAttributes["class"];
      showIndicator?: boolean;
      indicatorClass?: HTMLAttributes["class"];
    }
  >(),
  {
    showIndicator: true,
  },
);

const delegatedProps = reactiveOmit(
  props,
  "class",
  "showIndicator",
  "indicatorClass",
);
</script>

<template>
  <TabsList data-slot="tabs-list" v-bind="delegatedProps" :class="cn(
    'relative isolate bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-full p-[3px]',
    props.class,
  )
    ">
    <slot />
    <TabsIndicator v-if="showIndicator" :class="indicatorClass" />
  </TabsList>
</template>
