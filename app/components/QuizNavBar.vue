<script setup lang="ts">
defineProps<{
  courseCode: string;
  stage: "setup" | "generating" | "answering" | "results";
}>();

const emit = defineEmits<{
  newQuiz: [];
}>();
</script>

<template>
  <header
    class="sticky top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-border bg-background px-4">
    <div class="flex justify-start">
      <Button variant="ghost" size="sm" class="gap-1.5 text-sm" as-child>
        <NuxtLink :to="`/search/${courseCode}`">
          <LucideArrowLeft class="h-4 w-4" />
          Tentor
        </NuxtLink>
      </Button>
    </div>

    <div class="text-sm font-medium tracking-wide text-foreground">
      {{ courseCode }}
    </div>

    <div class="flex justify-end">
      <Button variant="ghost" size="sm" class="gap-1.5 text-sm" :disabled="stage === 'generating'"
        @click="emit('newQuiz')">
        <LucideRefreshCw class="h-4 w-4" :class="stage === 'generating' ? 'animate-spin' : ''" />
        Nytt quiz
      </Button>
    </div>
  </header>
</template>
