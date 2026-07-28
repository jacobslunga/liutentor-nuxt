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
        // A single container, not a track with a pill inside it: the outer
        // capsule sits on the page background and the active segment fills it
        // edge to edge, clipped to the capsule's own radius by overflow-hidden.
        'relative isolate bg-background text-muted-foreground inline-flex h-9 w-fit items-center justify-center overflow-hidden rounded-lg border border-border p-0',
        props.class,
      )
    "
  >
    <slot />
    <TabsIndicator v-if="showIndicator" />
  </TabsList>
</template>
