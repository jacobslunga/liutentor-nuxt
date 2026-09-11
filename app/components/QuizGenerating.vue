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
          class="rounded-full transition-all duration-300 ease-spring"
          :class="[
            i < currentStepIndex ? 'h-1.5 w-1.5 bg-inverted' : '',
            i === currentStepIndex
              ? 'h-2 w-2 bg-inverted step-dot-active'
              : '',
            i > currentStepIndex ? 'h-1.5 w-1.5 bg-inverted/20' : '',
          ]"
        />
      </div>

      <p class="shimmer-text text-sm font-medium">
        {{ statusMessage }}
      </p>

      <UButton
        v-if="!error"
        color="neutral"
        variant="ghost"
        size="sm"
        class="gap-1.5 text-muted"
        @click="emit('cancel')"
      >
        <UIcon name="i-lucide-x" class="h-3.5 w-3.5" />
        Avbryt
      </UButton>

      <Transition
        enter-active-class="transition-all duration-200 ease-spring"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition-all duration-150 ease-spring"
        leave-to-class="opacity-0"
      >
        <div v-if="error" class="text-center">
          <p class="text-sm text-error">Kunde inte generera quizet.</p>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="mt-3 gap-1.5"
            @click="emit('retry')"
          >
            <UIcon name="i-lucide-loader-circle" class="h-3.5 w-3.5" />
            Försök igen
          </UButton>
        </div>
      </Transition>
    </div>
  </div>
</template>
