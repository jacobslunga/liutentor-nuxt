<script setup lang="ts">
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Check } from "@lucide/vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes["class"] }>()

const emits = defineEmits<DropdownMenuRadioItemEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DropdownMenuRadioItem data-slot="dropdown-menu-radio-item" v-bind="forwarded" :class="cn(
    `focus:bg-accent focus:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
    props.class,
  )">
    <slot />
    <span class="pointer-events-none ml-auto flex size-4 shrink-0 items-center justify-center pl-3">
      <DropdownMenuItemIndicator>
        <slot name="indicator-icon">
          <Check class="size-4 text-primary" />
        </slot>
      </DropdownMenuItemIndicator>
    </span>
  </DropdownMenuRadioItem>
</template>
