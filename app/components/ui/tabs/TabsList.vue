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
    }
  >(),
  {
    showIndicator: true,
  },
);

const delegatedProps = reactiveOmit(props, "class", "showIndicator");
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      cn(
        // The track is recessed and the indicator raised. In dark mode --muted
        // is *lighter* than the page, so the track has to go the other way
        // (black/20) for the active pill to read as raised at all.
        'relative bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-1 dark:bg-black/20 border border-border',
        props.class,
      )
    "
  >
    <slot />
    <TabsIndicator v-if="showIndicator" />
  </TabsList>
</template>
