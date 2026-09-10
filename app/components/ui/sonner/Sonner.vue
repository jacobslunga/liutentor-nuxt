<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
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
      <Icon name="octicon:check-circle-fill-16" class="size-4" />
    </template>
    <template #info-icon>
      <Icon name="octicon:info-16" class="size-4" />
    </template>
    <template #warning-icon>
      <Icon name="octicon:alert-fill-16" class="size-4" />
    </template>
    <template #error-icon>
      <Icon name="octicon:x-circle-fill-16" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="octicon:sync-16" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="octicon:x-16" class="size-4" />
    </template>
  </Sonner>
</template>
