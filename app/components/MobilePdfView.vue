<script setup lang="ts">
const props = defineProps<{
  examPdfUrl: string;
  solutionPdfUrl: string | null;
  courseCode: string;
  examDate: string;
}>();

const showSolution = ref(false);
const hasSolution = computed(() => !!props.solutionPdfUrl);

watch(
  () => props.examPdfUrl,
  () => {
    showSolution.value = false;
  },
);
</script>

<template>
  <div class="flex lg:hidden flex-col h-screen w-full bg-background relative">
    <div
      class="absolute inset-x-0 top-0 z-40 flex items-center gap-3 px-3 h-12 bg-linear-to-b from-background to-transparent"
    >
      <NuxtLink
        :to="`/search/${courseCode}`"
        class="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-foreground active:scale-95 transition-transform"
        aria-label="Gå tillbaka"
      >
        <LucideArrowLeft class="w-4 h-4" />
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-foreground truncate leading-tight">
          {{ courseCode }}
        </p>
        <p class="text-xs text-muted-foreground truncate leading-tight">
          {{ examDate }}
        </p>
      </div>

      <button
        v-if="hasSolution"
        class="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background text-foreground text-xs active:scale-95 transition-transform"
        @click="showSolution = true"
      >
        <LucideBookOpen class="w-3.5 h-3.5 text-primary" />
        Facit
      </button>
    </div>

    <div class="w-full h-full overflow-auto pt-12">
      <ClientOnly>
        <PdfRenderer :pdf-url="examPdfUrl" />
      </ClientOnly>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-[0.99]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-[0.99]"
    >
      <section
        v-if="showSolution"
        class="fixed inset-0 z-50 h-screen w-screen bg-background flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-3 h-12 bg-linear-to-b from-background to-transparent"
        >
          <div class="min-w-0 flex-1">
            <p
              class="text-sm font-semibold text-foreground truncate leading-tight"
            >
              Facit
            </p>
            <p class="text-xs text-muted-foreground truncate leading-tight">
              {{ courseCode }} - {{ examDate }}
            </p>
          </div>
          <button
            class="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-foreground active:scale-95 transition-transform"
            aria-label="Stäng"
            @click="showSolution = false"
          >
            <LucideX class="w-4 h-4" />
          </button>
        </div>

        <div class="h-full w-full overflow-auto pt-12">
          <ClientOnly>
            <PdfRenderer v-if="solutionPdfUrl" :pdf-url="solutionPdfUrl" />
          </ClientOnly>
        </div>
      </section>
    </Transition>
  </div>
</template>
