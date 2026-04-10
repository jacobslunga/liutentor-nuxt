<template>
  <div class="shrink-0 flex items-center justify-between px-3 py-2 z-100">
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" class="size-8" @click="emit('close')">
        <LucideChevronRight />
      </Button>
      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-default"
        :class="
          hasSolution
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-muted/50 text-muted-foreground'
        "
      >
        <LucideCircleCheck v-if="hasSolution" class="w-4 h-4" />
        <LucideSquareX v-else class="w-4 h-4" />
        <span class="font-medium">Lösning</span>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <NuxtLink to="/feedback" target="_blank">
        <Button variant="ghost" size="sm" class="h-8 gap-1.5 text-xs">
          <LucideMessageCircle />
          Feedback
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hasSolution: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>
