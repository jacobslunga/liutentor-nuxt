<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { PEEK_CONTENT_HEIGHT } from "@/composables/useSheetDetents";

const props = defineProps<{
  examPdfUrl: string;
  solutionPdfUrl: string | null;
  courseCode: string;
  examDate: string;
  explainEnabled?: boolean;
}>();

const emit = defineEmits<{ explain: [text: string] }>();

const HEADER_HEIGHT = 56 + 1;

const pdfBoxStyle = {
  paddingTop: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
  paddingBottom: `calc(${PEEK_CONTENT_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
};

const showSolution = ref(false);
const isDownloadOpen = ref(false);
const hasSolution = computed(() => !!props.solutionPdfUrl);
const hasDownload = computed(
  () => !!props.examPdfUrl || !!props.solutionPdfUrl,
);

watch(
  () => props.examPdfUrl,
  () => {
    showSolution.value = false;
  },
);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && showSolution.value) {
    showSolution.value = false;
    return;
  }

  if (
    event.key.toLowerCase() !== "f" ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.repeat ||
    isTypingTarget(event.target) ||
    !hasSolution.value
  ) {
    return;
  }

  showSolution.value = !showSolution.value;
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const downloadFile = async (url: string, filename: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
};

const downloadItems = computed<DropdownMenuItem[]>(() => [
  {
    label: "Ladda ned tenta",
    icon: "i-lucide-download",
    disabled: !props.examPdfUrl,
    onSelect: () =>
      downloadFile(props.examPdfUrl, `${props.courseCode}_${props.examDate}_EXAM.pdf`),
  },
  {
    label: "Ladda ned facit",
    icon: "i-lucide-download",
    disabled: !props.solutionPdfUrl,
    onSelect: () =>
      downloadFile(
        props.solutionPdfUrl!,
        `${props.courseCode}_${props.examDate}_SOLUTION.pdf`,
      ),
  },
]);
</script>

<template>
  <div class="relative h-dvh w-full bg-default overflow-hidden">
    <div class="absolute inset-x-0 top-0 z-30 bg-default border-b border-default pt-[env(safe-area-inset-top,0px)]">
      <div class="flex h-14 shrink-0 items-center gap-3 px-3">
        <NuxtLink :to="`/search/${courseCode}`">
          <UButton aria-label="Gå tillbaka" color="neutral" variant="outline" size="sm" square>
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          </UButton>
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-highlighted truncate leading-tight">
            {{ courseCode }}
          </p>
          <p class="text-xs text-muted truncate leading-tight">
            {{ examDate }}
          </p>
        </div>
        <UDropdownMenu v-model:open="isDownloadOpen" :items="downloadItems" :content="{ align: 'end', sideOffset: 8 }">
          <UButton color="neutral" variant="outline" size="sm" square :disabled="!hasDownload" aria-label="Ladda ned">
            <UIcon name="i-lucide-download" class="w-4 h-4" />
          </UButton>
        </UDropdownMenu>
        <UButton v-if="hasSolution" color="neutral" variant="outline" size="sm" @click="showSolution = true">
          <UIcon name="i-lucide-book-open" class="w-3.5 h-3.5 text-primary" />
          Facit
        </UButton>
      </div>
    </div>

    <div class="h-full w-full overflow-hidden" :style="pdfBoxStyle">
      <ClientOnly>
        <LazyPdfRenderer :pdf-url="examPdfUrl" :explain-enabled="explainEnabled" @explain="emit('explain', $event)" />
      </ClientOnly>
    </div>

    <Transition enter-active-class="transition duration-200 ease-spring"
      enter-from-class="opacity-0 translate-y-4 scale-[0.99]" enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-spring" leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-[0.99]">
      <section v-show="showSolution" class="fixed inset-0 z-40 h-dvh w-screen bg-default overflow-hidden"
        role="dialog" aria-modal="true">
        <div
          class="absolute inset-x-0 top-0 z-10 bg-default border-b border-default pt-[env(safe-area-inset-top,0px)]">
          <div class="flex h-14 shrink-0 items-center gap-3 px-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-highlighted truncate leading-tight">
                Facit
              </p>
              <p class="text-xs text-muted truncate leading-tight">
                {{ courseCode }} - {{ examDate }}
              </p>
            </div>
            <UButton color="neutral" variant="outline" size="sm" square aria-label="Stäng"
              @click="showSolution = false">
              <UIcon name="i-lucide-x" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
        <div class="h-full w-full overflow-hidden" :style="pdfBoxStyle">
          <ClientOnly>
            <LazyPdfRenderer v-if="solutionPdfUrl" :pdf-url="solutionPdfUrl" :explain-enabled="explainEnabled"
              @explain="emit('explain', $event)" />
          </ClientOnly>
        </div>
      </section>
    </Transition>
  </div>
</template>
