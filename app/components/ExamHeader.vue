<script setup lang="ts">
import { useChatStore } from "@/stores/chat";

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
const chatStore = useChatStore();
const { startSession } = useLockInMode();
const isExamSidebarOpen = ref(false);
const sidebarContentReady = ref(false);
const examListRef = ref<HTMLDivElement | null>(null);
const isDownloadOpen = ref(false);
const isSettingsOpen = ref(false);
const isLockInOpen = ref(false);
const lockInDuration = ref<string | null>(null);
const showLockInConfirm = ref(false);
let sidebarRevealTimer: ReturnType<typeof setTimeout> | null = null;

const TIME_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 timme" },
  { value: "120", label: "2 timmar" },
  { value: "180", label: "3 timmar" },
  { value: "240", label: "4 timmar" },
  { value: "300", label: "5 timmar" },
];

const sortedExams = computed(() =>
  [...props.exams].sort(
    (a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime(),
  ),
);

const selectedExam = computed(
  () => sortedExams.value.find((e) => e.id.toString() === props.examId) ?? null,
);

const hasDownload = computed(
  () => !!selectedExam.value?.pdf_url || !!props.solutionPdfUrl,
);

const selectedDurationLabel = computed(
  () => TIME_OPTIONS.find((o) => o.value === lockInDuration.value)?.label ?? "",
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
  if (event.key === "Escape" && isExamSidebarOpen.value) {
    isExamSidebarOpen.value = false;
    return;
  }

  if (
    event.key.toLowerCase() === "t" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.repeat &&
    !isTypingTarget(event.target)
  ) {
    isExamSidebarOpen.value = !isExamSidebarOpen.value;
  }
}

const changeExam = (e: Exam) => {
  if (e.id.toString() === props.examId) {
    isExamSidebarOpen.value = false;
    return;
  }
  isExamSidebarOpen.value = false;
  router.push(`/search/${props.courseCode}/${e.id}`);
};

watch(isExamSidebarOpen, (open) => {
  if (sidebarRevealTimer) {
    clearTimeout(sidebarRevealTimer);
    sidebarRevealTimer = null;
  }

  if (!open) {
    sidebarContentReady.value = false;
    return;
  }

  sidebarRevealTimer = setTimeout(() => {
    sidebarContentReady.value = true;
    nextTick(() => {
      const activeEl = examListRef.value?.querySelector('[data-current="true"]');
      activeEl?.scrollIntoView({ block: "center" });
    });
  }, 110);
});

onUnmounted(() => {
  if (sidebarRevealTimer) {
    clearTimeout(sidebarRevealTimer);
    sidebarRevealTimer = null;
  }
  window.removeEventListener("keydown", handleKeyDown);
});

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
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

function selectLockInDuration(value: string) {
  lockInDuration.value = value;
  isLockInOpen.value = false;
  showLockInConfirm.value = true;
}

function confirmLockIn() {
  if (!selectedExam.value || !lockInDuration.value) return;
  const session = startSession(
    selectedExam.value.id.toString(),
    selectedExam.value.course_code,
    selectedExam.value.exam_name,
    parseInt(lockInDuration.value),
  );
  showLockInConfirm.value = false;
  router.push(`/lock-in/${session.examId}`);
}
</script>

<template>
  <div
    class="hidden lg:flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4"
  >
    <div class="flex items-center gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        @click="router.push(`/search/${courseCode}`)"
      >
        <LucideArrowLeft class="size-5.5" />
      </Button>

      <TooltipProvider v-if="selectedExam" :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="focus-visible:border-transparent focus-visible:ring-0"
              aria-label="Visa tentor"
              @click="isExamSidebarOpen = !isExamSidebarOpen"
            >
              <LucidePanelLeft class="size-5.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ isExamSidebarOpen ? "Stäng tentor" : "Visa tentor" }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div v-if="selectedExam" class="min-w-0 max-w-96 px-2">
        <p class="truncate text-xs font-semibold leading-none">
          {{ selectedExam.exam_name.replace(selectedExam.exam_date, "").trim() }}
        </p>
        <p class="mt-1 text-xs leading-none text-muted-foreground">
          {{ selectedExam.exam_date }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <DropdownMenu v-model:open="isLockInOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" :disabled="!selectedExam">
            <LucideLock class="w-3.5 h-3.5" />
            <span class="text-xs">Lock in</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8" class="w-44">
          <div
            class="px-2 py-1.5 text-[11px] font-medium text-muted-foreground border-b mb-1"
          >
            Välj varaktighet
          </div>
          <DropdownMenuItem
            v-for="opt in TIME_OPTIONS"
            :key="opt.value"
            class="gap-2 text-sm cursor-pointer"
            @click="selectLockInDuration(opt.value)"
          >
            <LucideTimer class="w-3.5 h-3.5 opacity-70" />
            {{ opt.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu v-model:open="isDownloadOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" :disabled="!hasDownload">
            <span class="text-xs">Ladda ned</span>
            <LucideChevronDown class="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8">
          <DropdownMenuItem
            class="gap-2 text-sm cursor-pointer"
            :disabled="!selectedExam?.pdf_url"
            @click="
              downloadFile(
                selectedExam!.pdf_url,
                `${selectedExam!.course_code}_${selectedExam!.exam_date}_EXAM.pdf`,
              )
            "
          >
            <LucideDownload class="w-4 h-4" /> Ladda ned tenta
          </DropdownMenuItem>
          <DropdownMenuItem
            class="gap-2 text-sm cursor-pointer"
            :disabled="!solutionPdfUrl"
            @click="
              downloadFile(
                solutionPdfUrl!,
                `${selectedExam?.course_code}_${selectedExam?.exam_date}_SOLUTION.pdf`,
              )
            "
          >
            <LucideDownload class="w-4 h-4" /> Ladda ned facit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        @click="chatStore.toggle()"
      >
        <LucideLoader2
          v-if="chatStore.isLoading"
          class="size-3.5 animate-spin"
        />
        <LucideMessageSquare v-else class="w-4 h-4" />
        <span class="text-xs">{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </Button>

      <Dialog v-model:open="isSettingsOpen">
        <DialogTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
          >
            <LucideSettings class="w-4.5 h-4.5" />
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-md">
          <DialogHeader>
            <DialogTitle>Inställningar</DialogTitle>
            <DialogDescription>Anpassa din studieupplevelse</DialogDescription>
          </DialogHeader>
          <SettingsDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <Teleport to="body">
    <div
      class="fixed inset-x-0 top-14 bottom-0 z-90 transition-opacity duration-200 ease-out"
      :class="
        isExamSidebarOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      "
      aria-hidden="true"
      @click="isExamSidebarOpen = false"
    />

    <aside
      class="fixed top-14 left-0 z-100 h-[calc(100vh-3.5rem)] w-86 border-r border-border bg-background transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)]"
      :class="isExamSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Välj tenta"
    >
      <div class="flex h-full min-h-0 flex-col">
        <div class="border-b px-4 py-3 flex items-center justify-between gap-2">
          <div class="min-w-0">
            <h2 class="text-sm font-semibold">Tentor</h2>
            <p class="text-xs text-muted-foreground">
              {{ sortedExams.length }} tentor
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="size-7 shrink-0"
            @click="isExamSidebarOpen = false"
          >
            <LucideX class="w-4 h-4" />
          </Button>
        </div>

        <div
          ref="examListRef"
          class="flex-1 min-h-0 overflow-y-auto px-2 py-2 custom-scrollbar transition-opacity duration-150 ease-out"
          :class="
            isExamSidebarOpen && sidebarContentReady ? 'opacity-100' : 'opacity-0'
          "
        >
          <div
            v-if="sortedExams.length === 0"
            class="px-2 py-4 text-sm text-muted-foreground"
          >
            Inga tentor hittades.
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="e in sortedExams"
              :key="e.id"
              :data-current="e.id.toString() === examId"
              class="group w-full cursor-pointer rounded-md border px-3 py-3 text-left transition-colors"
              :class="
                e.id.toString() === examId
                  ? 'border-primary/25 bg-primary/8'
                  : 'border-transparent hover:bg-muted/40'
              "
              @click="changeExam(e)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-foreground">
                      {{ e.exam_date }}
                    </span>
                    <span
                      v-if="e.id.toString() === examId"
                      class="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary"
                    >
                      Aktiv
                    </span>
                    <span
                      v-if="e.has_solution"
                      class="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      Facit
                    </span>
                  </div>
                  <p class="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                    {{ e.exam_name.replace(e.exam_date, "").trim() }}
                  </p>
                </div>
                <LucideChevronRight
                  v-if="e.id.toString() !== examId"
                  class="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  </Teleport>

  <AlertDialog
    :open="showLockInConfirm"
    @update:open="showLockInConfirm = $event"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle
          >Är du säker på att du vill locka in?</AlertDialogTitle
        >
        <AlertDialogDescription>
          Du startar en session på {{ selectedDurationLabel }}. Du kommer inte
          kunna se lösningar under denna tid.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showLockInConfirm = false"
          >Avbryt</AlertDialogCancel
        >
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          @click="confirmLockIn"
        >
          Starta timer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
