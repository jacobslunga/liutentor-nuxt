<script setup lang="ts">
import type { DialogCloseProps } from "reka-ui";
import { DialogClose } from "reka-ui";

const props = defineProps<DialogCloseProps>();
</script>

<template>
  <DialogClose data-slot="dialog-close" class="cursor-pointer" v-bind="props">
    <slot />
  </DialogClose>
</template>
