<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Exam } from "~/types/exam";

const props = defineProps<{
  exams: Exam[];
  examId: string;
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
  paddingBottom: "0px",
};

const isExamPickerOpen = ref(false);
const examList = useTemplateRef("examList");
const { sortBy, sortDirection } = useExamSortPreference("exam-picker");
const sortedExams = computed(() => [...props.exams].sort((a, b) => {
  if (sortBy.value === "pass-rate") {
    const aHasRate = Number.isFinite(Number(a.pass_rate)) && Number(a.pass_rate) > 0;
    const bHasRate = Number.isFinite(Number(b.pass_rate)) && Number(b.pass_rate) > 0;
    if (aHasRate !== bHasRate) return aHasRate ? -1 : 1;
    if (aHasRate && bHasRate) {
      const difference = Number(a.pass_rate) - Number(b.pass_rate);
      if (difference) return sortDirection.value === "asc" ? difference : -difference;
    }
  } else {
    const difference = a.exam_date.localeCompare(b.exam_date);
    if (difference) return sortDirection.value === "asc" ? difference : -difference;
  }
  return b.exam_date.localeCompare(a.exam_date) || a.exam_name.localeCompare(b.exam_name);
}));

watch(isExamPickerOpen, async (open) => {
  if (!open) return;
  await nextTick();
  examList.value?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
});

function changeExam(exam: Exam) {
  isExamPickerOpen.value = false;
  if (String(exam.id) !== props.examId) {
    navigateTo(`/search/${props.courseCode}/${exam.id}`);
  }
}

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
    icon: "i-tabler-download",
    disabled: !props.examPdfUrl,
    onSelect: () =>
      downloadFile(
        props.examPdfUrl,
        `${props.courseCode}_${props.examDate}_EXAM.pdf`,
      ),
  },
  {
    label: "Ladda ned facit",
    icon: "i-tabler-download",
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
          <UButton aria-label="Gå tillbaka" color="neutral" variant="outline" square>
            <UIcon name="i-tabler-arrow-left" class="w-4 h-4" />
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
        <div v-if="exams.length" class="hidden shrink-0 md:block">
        <UPopover v-model:open="isExamPickerOpen"
          :content="{ align: 'start', sideOffset: 8 }">
          <UButton color="neutral" variant="outline" size="sm" aria-label="Byt tenta">
            {{ examDate }}
            <UIcon name="i-tabler-chevron-down" class="size-4 text-muted" />
          </UButton>
          <template #content>
            <div class="flex items-center justify-between gap-3 border-b px-3 py-2">
              <span class="text-xs font-semibold">Alla tentor</span>
              <span class="text-xs text-muted">{{ exams.length }} st</span>
            </div>
            <div ref="examList" class="max-h-[min(20rem,60dvh)] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto p-1.5 custom-scrollbar">
              <button v-for="item in sortedExams" :key="item.id"
                :aria-current="String(item.id) === examId ? 'page' : undefined"
                class="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left"
                :class="String(item.id) === examId ? 'bg-accented' : 'hover:bg-muted'"
                @click="changeExam(item)">
                <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ item.exam_name }}</span>
                <UBadge v-if="item.has_solution" color="success" variant="subtle" size="sm" label="Facit" />
                <span v-if="Number(item.pass_rate) > 0" class="text-xs tabular-nums"
                  :class="item.pass_rate >= 50 ? 'text-success' : item.pass_rate >= 30 ? 'text-warning' : 'text-error'">
                  {{ Number(item.pass_rate).toFixed(1) }}%
                </span>
                <UIcon v-if="String(item.id) === examId" name="i-tabler-check" class="size-4 shrink-0 text-primary" />
              </button>
            </div>
          </template>
        </UPopover>
        </div>
        <UDropdownMenu v-model:open="isDownloadOpen" :items="downloadItems" :content="{ align: 'end', sideOffset: 8 }">
          <UButton color="neutral" variant="outline" size="sm" square :disabled="!hasDownload" aria-label="Ladda ned">
            <UIcon name="i-tabler-download" class="w-4 h-4" />
          </UButton>
        </UDropdownMenu>
        <UButton v-if="hasSolution" color="neutral" variant="outline" size="sm" @click="showSolution = true">
          <UIcon name="i-tabler-book" class="w-3.5 h-3.5 text-primary" />
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
      <section v-show="showSolution" class="fixed inset-0 z-40 h-dvh w-screen bg-default overflow-hidden" role="dialog"
        aria-modal="true">
        <div class="absolute inset-x-0 top-0 z-10 bg-default border-b border-default pt-[env(safe-area-inset-top,0px)]">
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
              <UIcon name="i-tabler-x" class="w-4 h-4" />
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
