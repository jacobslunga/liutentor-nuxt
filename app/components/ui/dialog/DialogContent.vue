<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui";
import { cn } from "@/lib/utils";
import DialogOverlay from "./DialogOverlay.vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes["class"];
      showCloseButton?: boolean;

      variant?: "dialog" | "sheet";
    }
  >(),
  {
    showCloseButton: true,
    variant: "dialog",
  },
);
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "variant");

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const VARIANT_CLASSES = {
  dialog:
    "fixed top-[50%] left-[50%] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-3xl border duration-150 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 sm:max-w-lg",
  sheet:
    "fixed inset-x-0 bottom-0 max-h-[92dvh] max-w-none rounded-3xl rounded-b-none border border-b-0 duration-200 data-[state=closed]:slide-out-to-bottom-[100%] data-[state=open]:slide-in-from-bottom-[100%] sm:inset-x-auto sm:bottom-auto sm:top-[50%] sm:left-[50%] sm:max-h-none sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-b-3xl sm:border-b sm:duration-150 sm:data-[state=closed]:slide-out-to-bottom-2 sm:data-[state=open]:slide-in-from-bottom-2",
} as const;
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      :class="props.variant === 'sheet' ? 'hidden sm:block' : undefined"
    />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-100 grid w-full gap-4 p-6 ease-spring',
          VARIANT_CLASSES[props.variant],
          props.class,
        )
      "
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-full opacity-70 transition-opacity duration-150 ease-spring hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <LucideX />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
