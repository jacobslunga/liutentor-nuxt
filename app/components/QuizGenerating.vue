<script setup lang="ts">
const props = defineProps<{
  statusMessage: string;
  statusStep: string | null;
  error: string | null;
}>();

const emit = defineEmits<{
  retry: [];
  cancel: [];
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

</script>

<template>
  <div class="flex min-h-[55vh] flex-col items-center justify-center py-12">
    <div class="flex flex-col items-center gap-6">
      <div class="flex items-center gap-2">
        <div
          v-for="(step, i) in STEP_ORDER"
          :key="step"
          class="rounded-full transition-[width] duration-200 ease-spring"
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

      <Button
        v-if="!error"
        variant="ghost"
        size="sm"
        class="gap-1.5 text-muted-foreground"
        @click="emit('cancel')"
      >
        <LucideX class="h-3.5 w-3.5" />
        Avbryt
      </Button>

      <Transition
        enter-active-class="transition-all duration-200 ease-spring"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition-all duration-150 ease-spring"
        leave-to-class="opacity-0"
      >
        <div v-if="error" class="text-center">
          <p class="text-sm text-destructive">Kunde inte generera quizet.</p>
          <Button
            variant="outline"
            size="sm"
            class="mt-3 gap-1.5"
            @click="emit('retry')"
          >
            <LucideRefreshCw class="h-3.5 w-3.5" />
            Försök igen
          </Button>
        </div>
      </Transition>
    </div>
  </div>
</template>
