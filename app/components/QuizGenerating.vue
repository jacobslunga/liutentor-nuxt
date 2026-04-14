<script setup lang="ts">
const props = defineProps<{
  statusMessage: string;
  statusStep: string | null;
  error: string | null;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const STEP_ORDER = [
  "fetching_exams",
  "downloading_pdfs",
  "generating",
  "finalizing",
];

const currentStepIndex = computed(() =>
  props.statusStep ? STEP_ORDER.indexOf(props.statusStep) : -1,
);

const t = {
  failed: "Kunde inte generera quizet.",
  retry: "Försök igen",
};
</script>

<template>
  <div class="flex min-h-[55vh] flex-col items-center justify-center py-12">
    <div class="flex flex-col items-center gap-7">
      <div class="flex items-center gap-2">
        <div
          v-for="(step, i) in STEP_ORDER"
          :key="step"
          class="rounded-full transition-all duration-500"
          :class="[
            i < currentStepIndex ? 'h-1.5 w-1.5 bg-foreground' : '',
            i === currentStepIndex ? 'h-2 w-2 bg-foreground animate-pulse' : '',
            i > currentStepIndex ? 'h-1.5 w-1.5 bg-muted-foreground/20' : '',
          ]"
        />
      </div>

      <p class="text-sm font-medium text-muted-foreground animate-pulse">
        {{ statusMessage }}
      </p>

      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition-all duration-150"
        leave-to-class="opacity-0"
      >
        <div v-if="error" class="text-center">
          <p class="text-sm text-destructive">{{ t.failed }}</p>
          <Button
            variant="outline"
            size="sm"
            class="mt-3 gap-1.5"
            @click="emit('retry')"
          >
            <LucideRefreshCw class="h-3.5 w-3.5" />
            {{ t.retry }}
          </Button>
        </div>
      </Transition>
    </div>
  </div>
</template>
