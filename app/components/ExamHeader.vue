<script setup lang="ts">
interface Exam {
  id: number;
  exam_name: string;
  exam_date: string;
  has_solution: boolean;
  course_code: string;
  pdf_url: string;
}

const props = defineProps<{
  exams: Exam[];
  examId: string;
  courseCode: string;
  solutionPdfUrl?: string | null;
}>();

const router = useRouter();
const scrollRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(true);
const isHovering = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const sorted = computed(() =>
  [...props.exams].sort(
    (a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime(),
  ),
);

const selectedExam = computed(
  () => sorted.value.find((e) => e.id.toString() === props.examId) ?? null,
);

const isDropdownOpen = ref(false);
const isDownloadOpen = ref(false);
const isSettingsOpen = ref(false);

const anyOpen = computed(
  () => isDropdownOpen.value || isDownloadOpen.value || isSettingsOpen.value,
);

function handleMouseMove(e: MouseEvent) {
  if (e.clientY < 80 || anyOpen.value) {
    isVisible.value = true;
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isHovering.value && !anyOpen.value) isVisible.value = false;
    }, 2000);
  }
}

onMounted(() => {
  isVisible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!isHovering.value) isVisible.value = false;
  }, 2000);
  window.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  if (hideTimer) clearTimeout(hideTimer);
});

watch(isDropdownOpen, async (val) => {
  if (!val) return;
  await nextTick();
  await nextTick();
  const el = scrollRef.value?.querySelector(
    '[data-current="true"]',
  ) as HTMLElement | null;
  el?.scrollIntoView({ block: "center" });
});

watch(anyOpen, (val) => {
  if (val) {
    isVisible.value = true;
    if (hideTimer) clearTimeout(hideTimer);
  }
});

function changeExam(e: Exam) {
  isDropdownOpen.value = false;
  router.push(`/search/${props.courseCode}/${e.id}`);
}

async function downloadFile(url: string, filename: string) {
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
}

function handleDownloadExam() {
  if (!selectedExam.value?.pdf_url) return;
  downloadFile(
    selectedExam.value.pdf_url,
    `${selectedExam.value.course_code}_${selectedExam.value.exam_date}_EXAM.pdf`,
  );
}

function handleDownloadSolution() {
  if (!props.solutionPdfUrl || !selectedExam.value) return;
  downloadFile(
    props.solutionPdfUrl,
    `${selectedExam.value.course_code}_${selectedExam.value.exam_date}_SOLUTION.pdf`,
  );
}

const hasDownload = computed(
  () => !!selectedExam.value?.pdf_url || !!props.solutionPdfUrl,
);
</script>

<template>
  <div
    class="hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none items-start justify-between transition-all duration-300"
    :class="
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
    "
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- Left pill -->
    <div
      class="group flex items-center bg-background/80 backdrop-blur-md border border-border/60 rounded-full pointer-events-auto overflow-hidden"
    >
      <Button
        size="icon"
        variant="ghost"
        class="size-8 rounded-l-full rounded-r-none shrink-0"
        aria-label="Tillbaka"
        @click="router.push(`/search/${courseCode}`)"
      >
        <LucideArrowLeft class="w-3.5 h-3.5" />
      </Button>

      <div
        class="w-px self-stretch bg-border/60 shrink-0 transition-opacity duration-150 group-hover:opacity-0"
      />

      <DropdownMenu v-if="selectedExam" v-model:open="isDropdownOpen">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="rounded-r-full rounded-l-none h-8 px-3 gap-1.5 font-normal"
          >
            <span class="text-xs font-medium">{{
              selectedExam.exam_name.replace(selectedExam.exam_date, "").trim()
            }}</span>
            <span class="text-muted-foreground text-xs">{{
              selectedExam.exam_date
            }}</span>
            <LucideChevronDown
              class="w-3 h-3 text-muted-foreground transition-transform duration-200"
              :class="isDropdownOpen ? 'rotate-180' : ''"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          :side-offset="8"
          class="w-80 max-h-96 overflow-hidden p-0"
        >
          <div class="px-3 py-2 text-xs text-muted-foreground border-b">
            Välj tenta ({{ sorted.length }})
          </div>
          <div ref="scrollRef" class="max-h-80 overflow-y-auto">
            <DropdownMenuItem
              v-for="e in sorted"
              :key="e.id"
              :data-current="e.id.toString() === examId ? 'true' : undefined"
              class="flex items-center justify-between px-3 py-3 cursor-pointer mx-1 my-0.5 rounded-md"
              :class="
                e.id.toString() === examId
                  ? 'bg-primary/10 text-primary focus:bg-primary/10 focus:text-primary'
                  : ''
              "
              @click="changeExam(e)"
            >
              <div class="flex-1 min-w-0 pr-3">
                <div class="font-medium truncate text-sm">
                  {{ e.exam_name.replace(e.exam_date, "").trim() }}
                  <span class="font-normal">{{ e.exam_date }}</span>
                </div>
                <div class="text-xs text-muted-foreground mt-0.5">
                  {{
                    new Intl.DateTimeFormat("sv-SE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(e.exam_date))
                  }}
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span
                  v-if="e.has_solution"
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                >
                  Facit
                </span>
                <LucideCheck
                  v-if="e.id.toString() === examId"
                  class="w-3.5 h-3.5 text-primary shrink-0"
                />
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div
      class="group flex items-center bg-background/80 backdrop-blur-md border border-border/60 rounded-full pointer-events-auto overflow-hidden"
    >
      <DropdownMenu v-model:open="isDownloadOpen">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="rounded-l-full rounded-r-none h-8 px-3 font-normal"
            :disabled="!hasDownload"
          >
            <span class="text-xs">Ladda ned</span>
            <LucideChevronDown class="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8">
          <DropdownMenuItem
            class="cursor-pointer gap-2 text-sm"
            :disabled="!selectedExam?.pdf_url"
            @click="handleDownloadExam"
          >
            <LucideDownload class="w-3.5 h-3.5" />
            Ladda ned tenta
          </DropdownMenuItem>
          <DropdownMenuItem
            class="cursor-pointer gap-2 text-sm"
            :disabled="!solutionPdfUrl"
            @click="handleDownloadSolution"
          >
            <LucideDownload class="w-3.5 h-3.5" />
            Ladda ned facit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div
        class="w-px self-stretch bg-border/60 shrink-0 transition-opacity duration-150 group-hover:opacity-0"
      />

      <Dialog v-model:open="isSettingsOpen">
        <DialogTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 rounded-r-full rounded-l-none shrink-0"
          >
            <LucideSettings class="w-3.5 h-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent
          class="w-[95vw] max-w-125 max-h-[90vh] overflow-y-auto rounded-xl"
        >
          <DialogHeader>
            <DialogTitle class="text-2xl">Inställningar</DialogTitle>
            <DialogDescription>Anpassa din upplevelse</DialogDescription>
          </DialogHeader>
          <SettingsDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
