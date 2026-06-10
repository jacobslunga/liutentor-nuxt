<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner";
import { Toaster as Sonner } from "vue-sonner";
import { cn } from "@/lib/utils";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <LucideCheckCircle class="size-4" />
    </template>
    <template #info-icon>
      <LucideInfo class="size-4" />
    </template>
    <template #warning-icon>
      <LucideAlertCircle class="size-4" />
    </template>
    <template #error-icon>
      <LucideCircleX class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <LucideLoader2 class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <LucideX class="size-4" />
    </template>
  </Sonner>
</template>
