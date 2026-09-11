<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from "@nuxt/ui";
import type { Exam } from "~/types/exam";
import { useChatStore } from "@/stores/chat";
import { useLayoutStore } from "~/stores/layout";

const props = defineProps<{
  exams: Exam[];
  examId: string;
  courseCode: string;
  solutionPdfUrl?: string | null;
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

const theme = computed(() =>
  colorMode.preference === "dim" ? "dark" : colorMode.preference,
);

const THEME_OPTIONS = [
  { value: "light", label: "Ljust" },
  { value: "dark", label: "Mörkt" },
  { value: "system", label: "System" },
] as const;

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
  if (!hasPassRate(exam)) return "text-muted/50";
  if (exam.pass_rate >= 50) return "text-success";
  if (exam.pass_rate >= 30) return "text-warning";
  return "text-error";
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

// Kryssposter i två grupper — Nuxt UI:s dropdown har ingen radiovariant, men
// bara ett val per grupp är markerat åt gången.
const sortItems = computed<DropdownMenuItem[][]>(() => [
  [
    { label: "Sortera efter", type: "label" },
    ...(
      [
        { label: "Datum", value: "date" },
        { label: "Godkänd", value: "pass-rate" },
      ] as const
    ).map((option) => ({
      label: option.label,
      type: "checkbox" as const,
      checked: sortBy.value === option.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) setSortBy(option.value);
      },
    })),
  ],
  [
    { label: "Ordning", type: "label" },
    ...(
      [
        { label: "Fallande", value: "desc" },
        { label: "Stigande", value: "asc" },
      ] as const
    ).map((option) => ({
      label: option.label,
      type: "checkbox" as const,
      checked: sortDirection.value === option.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) setSortDirection(option.value);
      },
    })),
  ],
]);

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

// Flikarna visar bara ikoner, så varje trigger får sitt tillgängliga namn
// från en sr-only-etikett i leading-slotten.
// Flikarna visar bara ikoner, så namnet kommer från en sr-only-etikett.
const layoutTabs = [
  {
    value: "exam-with-facit",
    icon: "i-lucide-columns-2",
    ariaLabel: "Visa tenta och facit",
  },
  {
    value: "exam-only",
    icon: "i-lucide-panel-left-close",
    ariaLabel: "Visa endast tentan",
  },
] satisfies TabsItem[];

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

const actionItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: props.focusMode ? "Avsluta fokusläge" : "Fokusläge",
      icon: props.focusMode
        ? "i-lucide-minimize"
        : "i-lucide-maximize",
      kbds: ["F"],
      onSelect: () => emit("toggleFocusMode"),
    },
    {
      label: "Tema",
      icon:
        theme.value === "light"
          ? "i-lucide-sun"
          : theme.value === "dark"
            ? "i-lucide-moon"
            : "i-lucide-monitor",
      children: THEME_OPTIONS.map((option) => ({
        label: option.label,
        type: "checkbox" as const,
        checked: theme.value === option.value,
        onUpdateChecked: (checked: boolean) => {
          if (checked) setTheme(option.value);
        },
        onSelect: (event: Event) => event.preventDefault(),
      })),
    },
    {
      label: "Inställningar",
      icon: "i-lucide-settings",
      onSelect: () => (isSettingsOpen.value = true),
    },
    {
      label: "Ladda upp tenta/facit",
      icon: "i-lucide-upload",
      onSelect: () => openUploadModal(props.courseCode),
    },
  ],
  [
    {
      label: "Ladda ned",
      icon: "i-lucide-download",
      disabled: !hasDownload.value,
      children: [
        {
          label: "Tenta",
          icon: "i-lucide-file-text",
          disabled: !selectedExam.value?.pdf_url,
          onSelect: () =>
            downloadFile(
              selectedExam.value!.pdf_url,
              `${selectedExam.value!.course_code}_${selectedExam.value!.exam_date}_EXAM.pdf`,
            ),
        },
        {
          label: "Facit",
          icon: "i-lucide-file-check",
          disabled: !props.solutionPdfUrl,
          onSelect: () =>
            downloadFile(
              props.solutionPdfUrl!,
              `${selectedExam.value?.course_code}_${selectedExam.value?.exam_date}_SOLUTION.pdf`,
            ),
        },
      ],
    },
    {
      label: "Lock in",
      icon: "i-lucide-lock",
      disabled: !selectedExam.value,
      children: TIME_OPTIONS.map((opt) => ({
        label: opt.label,
        icon: "i-lucide-timer",
        onSelect: () => selectLockInDuration(opt.value),
      })),
    },
  ],
]);

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
    <UFieldGroup class="pointer-events-auto overflow-hidden rounded-md">
      <UButton color="neutral" variant="subtle" size="lg" aria-label="Tillbaka till kursen"
        @click="router.push(`/search/${courseCode}`)">
        <UIcon name="i-lucide-arrow-left" />
      </UButton>

      <UPopover v-if="selectedExam" v-model:open="isDropdownOpen" :content="{ align: 'start', sideOffset: 8 }"
        :ui="{ content: 'overflow-hidden' }">
        <UButton color="neutral" variant="subtle" size="lg" class="gap-1.5">
          <div class="flex flex-row items-baseline gap-1.5 leading-none">
            <span class="font-bold">{{
              selectedExam.exam_date
              }}</span>
          </div>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform duration-200"
            :class="{ 'rotate-180': isDropdownOpen }" />
        </UButton>

        <template #content>
          <div class="px-3 py-2 flex items-center justify-between gap-3 border-b">
            <span class="text-xs font-semibold text-highlighted">Alla tentor</span>
            <div class="flex items-center gap-1.5">
              <UDropdownMenu v-model:open="isSortMenuOpen" :items="sortItems">
                <UButton color="neutral" variant="outline" size="xs" :icon="sortDirection === 'desc'
                  ? 'i-lucide-arrow-down'
                  : 'i-lucide-arrow-up'
                  " :label="sortLabel" aria-label="Sortera tentor" />
              </UDropdownMenu>
              <span class="text-xs font-mono px-2 py-0.5 rounded-sm bg-muted text-muted font-medium">
                {{ sortedExams.length }} st
              </span>
            </div>
          </div>
          <div ref="scrollRef" class="max-h-80 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            <button v-for="e in sortedExams" :key="e.id" :data-current="e.id.toString() === examId"
              class="grid w-full grid-cols-[3.25rem_6.75rem_3.75rem_3.5rem_1rem] items-center gap-x-2 rounded-sm px-3 py-2 text-left transition-colors duration-150 cursor-pointer group"
              :class="e.id.toString() === examId
                ? 'bg-accented font-semibold text-highlighted'
                : 'hover:bg-inverted/5 text-highlighted/90 hover:text-highlighted'
                " @click="changeExam(e)">
              <span class="truncate text-sm font-normal text-highlighted">
                {{ getExamPrefix(e) }}
              </span>
              <span class="text-sm font-semibold tabular-nums">
                {{ e.exam_date }}
              </span>
              <UBadge v-if="e.has_solution" color="success" variant="subtle" size="sm" label="Facit"
                class="col-start-3 justify-self-start" />
              <span class="col-start-4 justify-self-end font-mono text-xs tabular-nums" :class="passColor(e)">
                {{ formatPassRate(e) }}
              </span>
              <UIcon name="i-lucide-check" v-if="e.id.toString() === examId" class="col-start-5 size-4 text-primary" />
              <span v-else class="col-start-5 size-4" aria-hidden="true" />
            </button>
          </div>
        </template>
      </UPopover>
    </UFieldGroup>

    <div class="pointer-events-auto flex items-center gap-2">
      <UButton @click="chatStore.toggle()">
        <UIcon name="i-lucide-loader-circle" v-if="chatStore.isLoading" class="animate-spin" />
        <UIcon name="i-lucide-message-circle" v-else />
        <span>{{ chatStore.isOpen ? "Stäng" : "Chatt" }}</span>
      </UButton>

      <div class="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100">
        <UTabs
          color="neutral"
          :model-value="layoutMode"
          :items="layoutTabs"
          :content="false"
          size="sm"
          class="w-auto"
          :ui="{
            root: 'w-auto inline-flex',
            list: 'w-auto inline-flex items-center',
            trigger: 'h-7 w-9.5 shrink-0 p-0 px-0 py-0 flex items-center justify-center',
            leadingIcon: 'size-4 shrink-0',
          }"
          @update:model-value="switchLayout"
        >
          <template #leading="{ item }">
            <UIcon :name="item.icon" :aria-label="item.ariaLabel" :title="item.ariaLabel" class="size-4 shrink-0" />
          </template>
        </UTabs>

        <UDropdownMenu v-model:open="isActionsOpen" :items="actionItems" :content="{ align: 'end', sideOffset: 8 }">
          <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-ellipsis" aria-label="Fler åtgärder" />
        </UDropdownMenu>
      </div>
    </div>
  </div>

  <SettingsDialog v-model:open="isSettingsOpen" hide-trigger />

  <UModal :open="showLockInConfirm" :dismissible="false" :close="false" title="Är du säker på att du vill locka in?"
    :description="`Du startar en session på ${selectedDurationLabel}. Du kommer inte kunna se lösningar under denna tid.`"
    @update:open="showLockInConfirm = $event">
    <template #footer>
      <UButton color="neutral" variant="outline" @click="showLockInConfirm = false">
        Avbryt
      </UButton>
      <UButton color="error" @click="confirmLockIn">Starta timer</UButton>
    </template>
  </UModal>
</template>
