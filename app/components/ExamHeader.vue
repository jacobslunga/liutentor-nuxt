<script setup lang="ts">
import { useChatStore } from "@/stores/chat";
import { useLayoutStore } from "~/stores/layout";

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
const layoutStore = useLayoutStore();
const { layoutMode } = storeToRefs(layoutStore);
const { startSession } = useLockInMode();
const isDropdownOpen = ref(false);
const isActionsOpen = ref(false);
const isSettingsOpen = ref(false);
const lockInDuration = ref<string | null>(null);
const showLockInConfirm = ref(false);
const scrollRef = ref<HTMLDivElement | null>(null);

watch(isDropdownOpen, (open) => {
  if (open) {
    nextTick(() => {
      const activeEl = scrollRef.value?.querySelector('[data-current="true"]');
      activeEl?.scrollIntoView({ block: "center" });
    });
  }
});

const { open: openUploadModal } = useUploadModal();

const TIME_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 timme" },
  { value: "120", label: "2 timmar" },
  { value: "180", label: "3 timmar" },
  { value: "240", label: "4 timmar" },
  { value: "300", label: "5 timmar" },
];

const sortedExams = computed(() =>
  [...props.exams].sort((a, b) => {
    const diff =
      new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime();
    if (diff !== 0) return diff;
    return a.exam_name.localeCompare(b.exam_name);
  }),
);

function getExamPrefix(exam: Exam | null): string {
  if (!exam?.exam_name) return "";
  const firstWord = exam.exam_name.trim().split(" ")[0] ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(firstWord)) return "";
  return firstWord;
}

const selectedExam = computed(
  () => sortedExams.value.find((e) => e.id.toString() === props.examId) ?? null,
);

const hasDownload = computed(
  () => !!selectedExam.value?.pdf_url || !!props.solutionPdfUrl,
);

const selectedDurationLabel = computed(
  () => TIME_OPTIONS.find((o) => o.value === lockInDuration.value)?.label ?? "",
);

function switchLayout(val: string | number) {
  if (val !== "exam-with-facit" && val !== "exam-only") return;
  layoutStore.setLayoutMode(val);
  chatStore.close();
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && isDropdownOpen.value) {
    isDropdownOpen.value = false;
    return;
  }
}

const changeExam = (e: Exam) => {
  if (e.id.toString() === props.examId) {
    isDropdownOpen.value = false;
    return;
  }
  isDropdownOpen.value = false;
  router.push(`/search/${props.courseCode}/${e.id}`);
};

onUnmounted(() => {
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
  isActionsOpen.value = false;
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
  <div class="hidden lg:flex h-12 shrink-0 z-60 w-full items-center justify-between px-4">
    <div class="flex items-center gap-1">
      <Button size="icon-xs" variant="ghost" @click="router.push(`/search/${courseCode}`)">
        <LucideArrowLeft />
      </Button>

      <DropdownMenu v-if="selectedExam" v-model:open="isDropdownOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="gap-2">
            <div class="flex flex-row items-center gap-2 leading-none">
              <span class="text-sm font-semibold">{{
                selectedExam.exam_date
              }}</span>
            </div>
            <LucideChevronDown class="w-4 h-4 text-muted-foreground transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" :side-offset="8" class="w-68 sm:w-72 p-0 overflow-hidden border-border/60">
          <div class="px-4 py-2.5 flex items-center justify-between border-b border-border/60 bg-muted/30">
            <span class="text-xs font-semibold text-foreground">Alla tentor</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {{ sortedExams.length }} st
            </span>
          </div>
          <div ref="scrollRef" class="max-h-80 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            <button v-for="e in sortedExams" :key="e.id" :data-current="e.id.toString() === examId"
              class="w-full flex items-center justify-between gap-2.5 text-left rounded-md px-3 py-2 transition-colors duration-150 cursor-pointer group"
              :class="e.id.toString() === examId
                ? 'bg-accent font-semibold text-accent-foreground'
                : 'hover:bg-muted/70 text-foreground/90 hover:text-foreground'
                " @click="changeExam(e)">
              <div class="flex items-center gap-1.5 min-w-0">
                <span v-if="getExamPrefix(e)" class="text-xs font-bold text-foreground shrink-0">
                  {{ getExamPrefix(e) }}
                </span>
                <span class="text-xs text-muted-foreground tracking-tight shrink-0">
                  {{ e.exam_date }}
                </span>
                <Badge v-if="e.has_solution" variant="outline"
                  class="text-2xs px-1.5 py-0.5 rounded-md font-medium border-success/30 bg-success/10 text-success shrink-0 ml-0.5">
                  Facit
                </Badge>
              </div>
              <LucideCheck v-if="e.id.toString() === examId" class="size-4 text-primary shrink-0 ml-auto" />
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="flex items-center gap-2">
      <Button variant="default" size="sm" class="h-8 px-3" @click="chatStore.toggle()">
        <LucideLoader2 v-if="chatStore.isLoading" class="size-3.5 animate-spin" />
        <LucideMessageSquare v-else class="size-3.5" />
        <span class="text-xs font-medium">{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </Button>

      <Tabs :model-value="layoutMode" @update:model-value="switchLayout">
        <TabsList class="h-8 backdrop-blur-sm">
          <TabsTrigger value="exam-with-facit" class="px-2.5 h-full rounded-md">
            <LucideColumns2 class="size-4" />
          </TabsTrigger>
          <TabsTrigger value="exam-only" class="px-2.5 h-full rounded-md">
            <LucidePanelRight class="size-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DropdownMenu v-model:open="isActionsOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Fler åtgärder">
            <LucideEllipsis class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8" class="w-52">
          <DropdownMenuItem class="cursor-pointer" @click="isSettingsOpen = true">
            <LucideSettings class="size-4" />
            Inställningar
          </DropdownMenuItem>

          <DropdownMenuItem class="cursor-pointer" @click="openUploadModal(courseCode)">
            <LucideUpload class="size-4" />
            Ladda upp tenta/facit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger :disabled="!hasDownload">
              <LucideDownload class="size-4" />
              Ladda ned
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-48">
              <DropdownMenuItem class="cursor-pointer" :disabled="!selectedExam?.pdf_url" @click="
                downloadFile(
                  selectedExam!.pdf_url,
                  `${selectedExam!.course_code}_${selectedExam!.exam_date}_EXAM.pdf`,
                )
                ">
                <LucideFileText class="size-4" />
                Tenta
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" :disabled="!solutionPdfUrl" @click="
                downloadFile(
                  solutionPdfUrl!,
                  `${selectedExam?.course_code}_${selectedExam?.exam_date}_SOLUTION.pdf`,
                )
                ">
                <LucideFileCheck class="size-4" />
                Facit
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger :disabled="!selectedExam">
              <LucideLock class="size-4" />
              Lock in
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-44">
              <DropdownMenuItem v-for="opt in TIME_OPTIONS" :key="opt.value" class="cursor-pointer"
                @click="selectLockInDuration(opt.value)">
                <LucideTimer class="size-3.5 opacity-70" />
                {{ opt.label }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <Dialog v-model:open="isSettingsOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Inställningar</DialogTitle>
        <DialogDescription>Anpassa din studieupplevelse</DialogDescription>
      </DialogHeader>
      <SettingsDialogContent />
    </DialogContent>
  </Dialog>

  <AlertDialog :open="showLockInConfirm" @update:open="showLockInConfirm = $event">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Är du säker på att du vill locka in?</AlertDialogTitle>
        <AlertDialogDescription>
          Du startar en session på {{ selectedDurationLabel }}. Du kommer inte
          kunna se lösningar under denna tid.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showLockInConfirm = false">Avbryt</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="confirmLockIn">
          Starta timer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
