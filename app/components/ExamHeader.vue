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
const isDropdownOpen = ref(false);
const isDownloadOpen = ref(false);
const isSettingsOpen = ref(false);
const isLockInOpen = ref(false);
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
    class="hidden lg:flex h-12 absolute top-0 z-60 w-full shrink-0 items-center justify-between bg-linear-to-b from-background via-background/90 to-background/0 px-4">
    <div class="flex items-center gap-1">
      <Button size="icon-sm" variant="ghost" @click="router.push(`/search/${courseCode}`)">
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
        <DropdownMenuContent align="start" :side-offset="8" class="w-76 p-0 overflow-hidden">
          <div class="px-3 py-2.5 flex items-center justify-between border-b">
            <span class="text-[11px] font-semibold text-foreground">Tentor</span>
            <span class="text-[11px] text-muted-foreground">{{ sortedExams.length }} st</span>
          </div>
          <div ref="scrollRef" class="max-h-80 overflow-y-auto p-1.5 space-y-1">
            <button v-for="e in sortedExams" :key="e.id" :data-current="e.id.toString() === examId"
              class="w-full text-left rounded-lg px-3 py-2.5 transition-colors cursor-pointer group" :class="e.id.toString() === examId
                ? 'bg-primary/8 ring-1 ring-primary/20'
                : 'hover:bg-foreground/5'
                " @click="changeExam(e)">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm" :class="e.id.toString() === examId
                      ? 'text-primary'
                      : 'text-foreground'
                      ">
                      {{ e.exam_date }}
                    </span>
                  </div>
                  <div class="text-[11px] text-muted-foreground mt-0.5 capitalize truncate">
                    {{ e.exam_name.replace(e.exam_date, "").trim() }}
                  </div>
                </div>
                <div class="shrink-0 pt-0.5">
                  <span v-if="e.has_solution"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Facit
                  </span>
                </div>
              </div>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <span v-if="selectedExam" class="text-sm font-normal text-muted-foreground">{{
        selectedExam.exam_name.replace(selectedExam.exam_date, "").trim()
      }}</span>
    </div>

    <div class="flex items-center gap-2">
      <div class="flex items-center gap-0.5">
        <LayoutSwitcher />

        <Dialog v-model:open="isSettingsOpen">
          <DialogTrigger as-child>
            <Button variant="ghost" size="icon-sm"
              class="text-muted-foreground/60 hover:bg-transparent hover:text-foreground">
              <LucideSettings class="size-4" />
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

      <div class="h-5 w-px bg-border/60" />

      <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground" @click="chatStore.toggle()">
        <LucideLoader2 v-if="chatStore.isLoading" class="size-3.5 animate-spin" />
        <LucideMessageSquare v-else class="size-4" />
        <span class="text-xs">{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </Button>

      <div class="h-5 w-px bg-border/60" />

      <div class="flex items-center gap-1.5">
        <DropdownMenu v-model:open="isDownloadOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground"
              :disabled="!hasDownload">
              <LucideDownload class="size-4" />
              <span class="text-xs">Ladda ned</span>
              <LucideChevronDown class="size-3.5 opacity-60 transition-transform duration-200"
                :class="{ 'rotate-180': isDownloadOpen }" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :side-offset="8">
            <DropdownMenuItem class="gap-2 text-sm cursor-pointer" :disabled="!selectedExam?.pdf_url" @click="
              downloadFile(
                selectedExam!.pdf_url,
                `${selectedExam!.course_code}_${selectedExam!.exam_date}_EXAM.pdf`,
              )
              ">
              <LucideDownload class="size-4" /> Ladda ned tenta
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2 text-sm cursor-pointer" :disabled="!solutionPdfUrl" @click="
              downloadFile(
                solutionPdfUrl!,
                `${selectedExam?.course_code}_${selectedExam?.exam_date}_SOLUTION.pdf`,
              )
              ">
              <LucideDownload class="size-4" /> Ladda ned facit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu v-model:open="isLockInOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="border-border/60 shadow-none" :disabled="!selectedExam">
              <LucideLock class="size-3.5" />
              <span class="text-xs font-medium">Lock in</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :side-offset="8" class="w-44">
            <div class="px-2 py-1.5 text-[11px] font-medium text-muted-foreground border-b mb-1">
              Välj varaktighet
            </div>
            <DropdownMenuItem v-for="opt in TIME_OPTIONS" :key="opt.value" class="gap-2 text-sm cursor-pointer"
              @click="selectLockInDuration(opt.value)">
              <LucideTimer class="size-3.5 opacity-70" />
              {{ opt.label }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>

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
