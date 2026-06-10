<script setup lang="ts">
const props = defineProps<{
  examPdfUrl: string;
  solutionPdfUrl: string | null;
  courseCode: string;
  examDate: string;
}>();

const showSolution = ref(false);
const isDownloadOpen = ref(false);
const hasSolution = computed(() => !!props.solutionPdfUrl);
const hasDownload = computed(() => !!props.examPdfUrl || !!props.solutionPdfUrl);

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
</script>

<template>
  <div class="flex flex-col h-screen w-full bg-background relative">
    <div
      class="absolute inset-x-0 top-0 z-40 flex h-12 items-center gap-3 bg-linear-to-b from-background via-background/90 to-background/0 px-3">
      <NuxtLink :to="`/search/${courseCode}`">
        <Button aria-label="Gå tillbaka" variant="outline" size="icon-sm">
          <LucideArrowLeft class="w-4 h-4" />
        </Button>
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-foreground truncate leading-tight">
          {{ courseCode }}
        </p>
        <p class="text-xs text-muted-foreground truncate leading-tight">
          {{ examDate }}
        </p>
      </div>
      <DropdownMenu v-model:open="isDownloadOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon-sm" :disabled="!hasDownload" aria-label="Ladda ned">
            <LucideDownload class="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8">
          <DropdownMenuItem class="gap-2 text-sm cursor-pointer" :disabled="!examPdfUrl" @click="
            downloadFile(
              examPdfUrl,
              `${courseCode}_${examDate}_EXAM.pdf`,
            )
            ">
            <LucideDownload class="size-4" /> Ladda ned tenta
          </DropdownMenuItem>
          <DropdownMenuItem class="gap-2 text-sm cursor-pointer" :disabled="!solutionPdfUrl" @click="
            downloadFile(
              solutionPdfUrl!,
              `${courseCode}_${examDate}_SOLUTION.pdf`,
            )
            ">
            <LucideDownload class="size-4" /> Ladda ned facit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button v-if="hasSolution" variant="outline" size="sm" @click="showSolution = true">
        <LucideBookOpen class="w-3.5 h-3.5 text-primary" />
        Facit
      </Button>
    </div>

    <div class="w-full h-full overflow-hidden">
      <ClientOnly>
        <PdfRenderer :pdf-url="examPdfUrl" />
      </ClientOnly>
    </div>

    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-[0.99]" enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-[0.99]">
      <section v-show="showSolution"
        class="fixed inset-0 z-50 h-screen w-screen bg-background flex flex-col overflow-hidden" role="dialog"
        aria-modal="true">
        <div
          class="absolute inset-x-0 top-0 z-10 flex h-12 items-center gap-3 bg-linear-to-b from-background via-background/90 to-background/0 px-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-foreground truncate leading-tight">
              Facit
            </p>
            <p class="text-xs text-muted-foreground truncate leading-tight">
              {{ courseCode }} - {{ examDate }}
            </p>
          </div>
          <Button variant="outline" size="icon-sm" aria-label="Stäng" @click="showSolution = false">
            <LucideX class="w-4 h-4" />
          </Button>
        </div>
        <div class="h-full w-full overflow-hidden">
          <ClientOnly>
            <PdfRenderer v-if="solutionPdfUrl" :pdf-url="solutionPdfUrl" />
          </ClientOnly>
        </div>
      </section>
    </Transition>
  </div>
</template>
