<script setup lang="ts">
import { useChatStore } from "@/stores/chat";
import ButtonGroup from "./ui/button-group/ButtonGroup.vue";

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
const { isSeenExam, getSeenAt } = useSeenExams();

function formatSeenAt(examId: string | number): string {
  const ts = getSeenAt(examId);
  if (!ts) return "";
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Idag";
  if (days === 1) return "Igår";
  if (days < 7) return `${days} dagar sedan`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} ${weeks === 1 ? "vecka" : "veckor"} sedan`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "månad" : "månader"} sedan`;
}

const scrollRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(true);
const isHovering = ref(false);
const isDropdownOpen = ref(false);
const isDownloadOpen = ref(false);
const isSettingsOpen = ref(false);
const isLockInOpen = ref(false);
const lockInDuration = ref<string | null>(null);
const showLockInConfirm = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

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

const isInternalElementOpen = computed(
  () =>
    isDropdownOpen.value ||
    isDownloadOpen.value ||
    isSettingsOpen.value ||
    isLockInOpen.value ||
    showLockInConfirm.value,
);

const hasDownload = computed(
  () => !!selectedExam.value?.pdf_url || !!props.solutionPdfUrl,
);

const selectedDurationLabel = computed(
  () => TIME_OPTIONS.find((o) => o.value === lockInDuration.value)?.label ?? "",
);

const startHideTimer = () => {
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!isHovering.value && !isInternalElementOpen.value) {
      isVisible.value = false;
    }
  }, 2500);
};

function handleMouseMove(e: MouseEvent) {
  if (e.clientY < 80 || isInternalElementOpen.value) {
    isVisible.value = true;
    startHideTimer();
  }
}

watch(
  () => chatStore.isOpen,
  (isOpen) => {
    isVisible.value = !isOpen;
    if (isOpen && hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  },
);

watch(isInternalElementOpen, (isOpen) => {
  if (isOpen) {
    isVisible.value = true;
    if (hideTimer) clearTimeout(hideTimer);
  } else {
    startHideTimer();
  }
});

watch(isDropdownOpen, async (val) => {
  if (!val) return;
  await nextTick();
  const activeEl = scrollRef.value?.querySelector('[data-current="true"]');
  activeEl?.scrollIntoView({ block: "center" });
});

const changeExam = (e: Exam) => {
  isDropdownOpen.value = false;
  router.push(`/search/${props.courseCode}/${e.id}`);
};

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

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
  startHideTimer();
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<template>
  <div
    class="hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none items-start justify-between transition-all duration-300 ease-in-out"
    :class="
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    "
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <ButtonGroup class="pointer-events-auto">
      <Button
        size="icon-sm"
        variant="outline"
        @click="router.push(`/search/${courseCode}`)"
      >
        <LucideArrowLeft class="w-4 h-4" />
      </Button>

      <DropdownMenu v-if="selectedExam" v-model:open="isDropdownOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            <span class="text-xs font-semibold">{{
              selectedExam.exam_name.replace(selectedExam.exam_date, "").trim()
            }}</span>
            <span class="text-muted-foreground text-xs">{{
              selectedExam.exam_date
            }}</span>
            <LucideChevronDown
              class="w-5 h-5 text-muted-foreground transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          :side-offset="8"
          class="w-76 p-0 overflow-hidden"
        >
          <div class="px-3 py-2.5 flex items-center justify-between border-b">
            <span
              class="text-[11px] font-semibold text-foreground tracking-wide uppercase"
              >Tentor</span
            >
            <span class="text-[11px] text-muted-foreground"
              >{{ sortedExams.length }} st</span
            >
          </div>
          <div
            ref="scrollRef"
            class="max-h-80 overflow-y-auto p-1.5 space-y-0.5"
          >
            <button
              v-for="e in sortedExams"
              :key="e.id"
              :data-current="e.id.toString() === examId"
              class="w-full text-left rounded-lg px-3 py-2.5 transition-colors cursor-pointer group"
              :class="
                e.id.toString() === examId
                  ? 'bg-primary/8 ring-1 ring-primary/20'
                  : 'hover:bg-foreground/5'
              "
              @click="changeExam(e)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span
                      class="font-semibold text-sm"
                      :class="
                        e.id.toString() === examId
                          ? 'text-primary'
                          : 'text-foreground'
                      "
                    >
                      {{ e.exam_date }}
                    </span>
                    <span
                      v-if="e.id.toString() === examId"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary"
                    >
                      Öppen
                    </span>
                  </div>
                  <div
                    class="text-[11px] text-muted-foreground mt-0.5 capitalize truncate"
                  >
                    {{ e.exam_name.replace(e.exam_date, "").trim() }}
                  </div>
                  <div
                    v-if="isSeenExam(e.id)"
                    class="flex items-center gap-1 mt-1"
                  >
                    <LucideCheck
                      class="w-2.5 h-2.5 text-emerald-500 shrink-0"
                    />
                    <span
                      class="text-[10px] text-emerald-600 dark:text-emerald-500"
                    >
                      Sedd · {{ formatSeenAt(e.id) }}
                    </span>
                  </div>
                </div>
                <div class="shrink-0 pt-0.5">
                  <span
                    v-if="e.has_solution"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    Facit
                  </span>
                </div>
              </div>
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>

    <ButtonGroup class="pointer-events-auto">
      <DropdownMenu v-model:open="isLockInOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" :disabled="!selectedExam">
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
          <Button variant="outline" size="sm" :disabled="!hasDownload">
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

      <Button variant="outline" size="sm" @click="chatStore.toggle()">
        <LucideLoader2
          v-if="chatStore.isLoading"
          class="size-3.5 animate-spin"
        />
        <LucideMessageSquare v-else class="w-4 h-4" />
        <span class="text-xs">{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </Button>

      <Dialog v-model:open="isSettingsOpen">
        <DialogTrigger as-child>
          <Button variant="outline" size="icon-sm">
            <LucideSettings class="w-4.5 h-4.5" />
          </Button>
        </DialogTrigger>
        <DialogContent class="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Inställningar</DialogTitle>
            <DialogDescription>Anpassa din studieupplevelse</DialogDescription>
          </DialogHeader>
          <SettingsDialogContent />
        </DialogContent>
      </Dialog>
    </ButtonGroup>
  </div>

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
