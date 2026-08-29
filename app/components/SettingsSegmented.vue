<script setup lang="ts">

defineProps<{
  options: readonly { value: string; label: string; hint?: string }[];
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }">

    <Button
      v-for="option in options"
      :key="option.value"
      variant="outline"
      class="h-auto flex-col items-start justify-start gap-0.5 rounded-2xl px-4 py-3 text-left whitespace-normal hover:border-primary hover:bg-primary/5 dark:hover:border-primary dark:hover:bg-primary/10"
      :class="model === option.value
        ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/15'
        : 'bg-card dark:bg-card'"
      @click="model = option.value"
    >
      <span class="block text-sm font-medium text-foreground">{{ option.label }}</span>
      <span v-if="option.hint" class="block text-xs leading-relaxed font-normal text-muted-foreground">
        {{ option.hint }}
      </span>
    </Button>
  </div>
</template>
