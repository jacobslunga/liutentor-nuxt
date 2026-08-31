<script setup lang="ts">
import { useChatStore } from "@/stores/chat";
import type { Exam } from "~/types/exam";
import { useLayoutStore } from "~/stores/layout";

const props = defineProps<{
  exams: Exam[];
  examId: string;
  courseCode: string;
  solutionPdfUrl?: string | null;
  /** The pointer is near the top edge, so the secondary controls come forward. */
  active?: boolean;
  focusMode?: boolean;
}>();

const emit = defineEmits<{ toggleFocusMode: [] }>();

const router = useRouter();
const chatStore = useChatStore();
const layoutStore = useLayoutStore();
const colorMode = useColorMode();
const { layoutMode } = storeToRefs(layoutStore);
const { startSession } = useLockInMode();
const isDropdownOpen = ref(false);
const isActionsOpen = ref(false);
const isSettingsOpen = ref(false);
const lockInDuration = ref<string | null>(null);
const showLockInConfirm = ref(false);
const scrollRef = ref<HTMLDivElement | null>(null);
const { sortBy, sortDirection } = useExamSortPreference("exam-picker");
const isSortMenuOpen = ref(false);

watch(isDropdownOpen, (open) => {
  if (!open) isSortMenuOpen.value = false;
  if (open) {
    nextTick(() => {
      const activeEl = scrollRef.value?.querySelector('[data-current="true"]');
      activeEl?.scrollIntoView({ block: "center" });
    });
  }
});

const { open: openUploadModal } = useUploadModal();

// "dim" är det gamla namnet på den mörka paletten och kan ligga kvar i sparade
// inställningar; menyn visar den som "Mörkt".
const theme = computed(() =>
  colorMode.preference === "dim" ? "dark" : colorMode.preference,
);

const THEME_OPTIONS = [
  { value: "light", label: "Ljust" },
  { value: "dark", label: "Mörkt" },
  { value: "system", label: "System" },
] as const;

const themeLabel = computed(
  () => THEME_OPTIONS.find((o) => o.value === theme.value)?.label ?? "System",
);

function setTheme(value: unknown) {
  if (typeof value === "string") colorMode.preference = value;
}

const TIME_OPTIONS = [
  { value: "30", label: "30 min" },
  { value: "60", label: "1 timme" },
  { value: "120", label: "2 timmar" },
  { value: "180", label: "3 timmar" },
  { value: "240", label: "4 timmar" },
  { value: "300", label: "5 timmar" },
];

function hasPassRate(exam: Exam) {
  return Number.isFinite(Number(exam.pass_rate)) && Number(exam.pass_rate) > 0;
}

function formatPassRate(exam: Exam) {
  return hasPassRate(exam) ? `${Number(exam.pass_rate).toFixed(1)}%` : "–";
}

function passColor(exam: Exam) {
  if (!hasPassRate(exam)) return "text-muted-foreground/50";
  if (exam.pass_rate >= 50) return "text-success";
  if (exam.pass_rate >= 30) return "text-warning";
  return "text-destructive";
}

const sortLabel = computed(() =>
  sortBy.value === "date" ? "Datum" : "Godkänd",
);

function setSortBy(value: unknown) {
  if (value === "date" || value === "pass-rate") {
    sortBy.value = value;
    isSortMenuOpen.value = false;
  }
}

function setSortDirection(value: unknown) {
  if (value === "asc" || value === "desc") {
    sortDirection.value = value;
    isSortMenuOpen.value = false;
  }
}

const sortedExams = computed(() =>
  [...props.exams].sort((a, b) => {
    if (sortBy.value === "pass-rate") {
      const aHasRate = hasPassRate(a);
      const bHasRate = hasPassRate(b);
      if (aHasRate !== bHasRate) return aHasRate ? -1 : 1;

      if (aHasRate && bHasRate) {
        const rateDiff = Number(a.pass_rate) - Number(b.pass_rate);
        if (rateDiff !== 0) {
          return sortDirection.value === "asc" ? rateDiff : -rateDiff;
        }
      }
    } else {
      const dateDiff = a.exam_date.localeCompare(b.exam_date);
      if (dateDiff !== 0) {
        return sortDirection.value === "asc" ? dateDiff : -dateDiff;
      }
    }

    const dateDiff = b.exam_date.localeCompare(a.exam_date);
    if (dateDiff !== 0) return dateDiff;
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

// Secondary chrome is a ghost until the pointer comes near, but an open menu or
// a keyboard focus has to keep it readable.
const isSecondaryLit = computed(
  () => props.active || isActionsOpen.value || isDropdownOpen.value,
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
  <div class="pointer-events-none relative isolate hidden h-12 w-full items-center justify-between px-3 lg:flex">
    <ButtonGroup class="pointer-events-auto overflow-hidden rounded-md bg-secondary">
      <Button size="sm" variant="ghost" aria-label="Tillbaka till kursen" @click="router.push(`/search/${courseCode}`)">
        <LucideArrowLeft />
      </Button>

      <DropdownMenu v-if="selectedExam" v-model:open="isDropdownOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="gap-1.5">
            <div class="flex flex-row items-baseline gap-1.5 leading-none">
              <span class="text-sm font-semibold">{{
                selectedExam.exam_date
              }}</span>
            </div>
            <LucideChevronDown class="size-4 text-muted-foreground transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" :side-offset="8" class="p-0 overflow-hidden">
          <div class="px-3 py-2 flex items-center justify-between gap-3 border-b">
            <span class="text-xs font-semibold text-foreground">Alla tentor</span>
            <div class="flex items-center gap-1.5">
              <DropdownMenuSub v-model:open="isSortMenuOpen">
                <DropdownMenuSubTrigger class="h-7 border px-2 py-1 text-xs" aria-label="Sortera tentor">
                  <LucideArrowDown v-if="sortDirection === 'desc'" class="size-3.5" />
                  <LucideArrowUp v-else class="size-3.5" />
                  {{ sortLabel }}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent class="w-44">
                  <DropdownMenuLabel>Sortera efter</DropdownMenuLabel>
                  <DropdownMenuRadioGroup :model-value="sortBy" @update:model-value="setSortBy">
                    <DropdownMenuRadioItem value="date" @select.prevent>Datum</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pass-rate" @select.prevent>Godkänd</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Ordning</DropdownMenuLabel>
                  <DropdownMenuRadioGroup :model-value="sortDirection" @update:model-value="setSortDirection">
                    <DropdownMenuRadioItem value="desc" @select.prevent>Fallande</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="asc" @select.prevent>Stigande</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <span class="text-xs font-mono px-2 py-0.5 rounded-sm bg-muted text-muted-foreground font-medium">
                {{ sortedExams.length }} st
              </span>
            </div>
          </div>
          <div ref="scrollRef" class="max-h-80 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            <button v-for="e in sortedExams" :key="e.id" :data-current="e.id.toString() === examId"
              class="grid w-full grid-cols-[3.25rem_6.75rem_3.75rem_3.5rem_1rem] items-center gap-x-2 rounded-sm px-3 py-2 text-left transition-colors duration-150 cursor-pointer group"
              :class="e.id.toString() === examId
                ? 'bg-accent font-semibold text-accent-foreground'
                : 'hover:bg-muted/70 text-foreground/90 hover:text-foreground'
                " @click="changeExam(e)">
              <span class="truncate text-sm font-normal text-foreground">
                {{ getExamPrefix(e) }}
              </span>
              <span class="text-sm font-semibold tabular-nums">
                {{ e.exam_date }}
              </span>
              <Badge v-if="e.has_solution" variant="outline"
                class="col-start-3 justify-self-start text-2xs px-1.5 py-0.5 rounded-sm font-medium border-success/30 bg-success/10 text-success">
                Facit
              </Badge>
              <span class="col-start-4 justify-self-end font-mono text-xs tabular-nums" :class="passColor(e)">
                {{ formatPassRate(e) }}
              </span>
              <LucideCheck v-if="e.id.toString() === examId" class="col-start-5 size-4 text-primary" />
              <span v-else class="col-start-5 size-4" aria-hidden="true" />
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>

    <div class="pointer-events-auto flex items-center gap-2">
      <Button size="sm" @click="chatStore.toggle()" class="font-medium">
        <LucideLoader2 v-if="chatStore.isLoading" class="size-3.5 animate-spin" />
        <LucideMessageSquare v-else class="size-3.5" />
        <span class="text-xs">{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </Button>

      <div class="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100">
        <Tabs :model-value="layoutMode" @update:model-value="switchLayout">
          <TabsList class="h-8">
            <TabsTrigger value="exam-with-facit" class="h-full px-2.5" aria-label="Visa tenta och facit"
              title="Tenta och facit">
              <LucideColumns2 class="size-4" />
            </TabsTrigger>
            <TabsTrigger value="exam-only" class="h-full px-2.5" aria-label="Visa endast tentan" title="Endast tenta">
              <LucidePanelRight class="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu v-model:open="isActionsOpen">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Fler åtgärder">
              <LucideEllipsis class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" :side-offset="8" class="w-52">
            <DropdownMenuItem class="cursor-pointer" @click="emit('toggleFocusMode')">
              <LucideMaximize v-if="!focusMode" class="size-4" />
              <LucideMinimize v-else class="size-4" />
              {{ focusMode ? "Avsluta fokusläge" : "Fokusläge" }}
              <DropdownMenuShortcut>F</DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <LucideSun v-if="theme === 'light'" class="size-4" />
                <LucideMoonStar v-else-if="theme === 'dark'" class="size-4" />
                <LucideMonitor v-else class="size-4" />
                Tema
                <span class="ml-auto pl-3 text-xs text-muted-foreground">{{ themeLabel }}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent class="w-40">
                <DropdownMenuRadioGroup :model-value="theme" @update:model-value="setTheme">
                  <DropdownMenuRadioItem v-for="option in THEME_OPTIONS" :key="option.value" :value="option.value"
                    class="cursor-pointer" @select.prevent>
                    {{ option.label }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

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
  </div>

  <SettingsDialog v-model:open="isSettingsOpen" hide-trigger />

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
