<script setup lang="ts">
import type { Exam } from "@/types/quiz";

const props = defineProps<{
  exams: Exam[];
  isLoading: boolean;
  examsLoading: boolean;
}>();

const emit = defineEmits<{
  generate: [payload: { examIds: number[]; customPrompt?: string }];
}>();

const MAX_SELECTION = 5;
const MAX_PROMPT_LENGTH = 300;

const selectedIds = ref<Set<number>>(new Set());
const customPrompt = ref("");
const isExamDialogOpen = ref(false);
const isClientReady = ref(false);
const hasAutoSelected = ref(false);

const availableExams = computed(() => props.exams.filter((e) => e.pdf_url));

const selectedCount = computed(() => selectedIds.value.size);
const canGenerate = computed(
  () => selectedCount.value > 0 && !props.isLoading && !props.examsLoading,
);
const selectedExams = computed(() =>
  availableExams.value.filter((exam) => selectedIds.value.has(exam.id)),
);

watch(
  availableExams,
  (next) => {
    const allowedIds = new Set(next.map((exam) => exam.id));
    const filtered = [...selectedIds.value].filter((id) => allowedIds.has(id));
    if (filtered.length !== selectedIds.value.size) {
      selectedIds.value = new Set(filtered);
    }
  },
  { deep: false },
);

watch(
  [availableExams, () => props.examsLoading, isClientReady],
  ([nextExams, loading, ready]) => {
    if (!ready || loading) return;
    if (nextExams.length === 0) {
      selectedIds.value = new Set();
      hasAutoSelected.value = false;
      return;
    }

    if (!hasAutoSelected.value && selectedIds.value.size === 0) {
      randomize();
      hasAutoSelected.value = true;
    }
  },
  { immediate: false },
);

onMounted(() => {
  isClientReady.value = true;
});

function toggleExam(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else if (selectedIds.value.size < MAX_SELECTION) {
    selectedIds.value.add(id);
  }
  hasAutoSelected.value = true;
}

function randomize() {
  const shuffled = [...availableExams.value].sort(() => Math.random() - 0.5);
  const count = Math.min(
    shuffled.length <= 2 ? shuffled.length : Math.floor(Math.random() * 3) + 2,
    MAX_SELECTION,
  );
  selectedIds.value = new Set(shuffled.slice(0, count).map((e) => e.id));
}

function handleGenerate() {
  if (!canGenerate.value) return;
  emit("generate", {
    examIds: [...selectedIds.value],
    customPrompt: customPrompt.value.trim() || undefined,
  });
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-6 sm:py-8">
    <h1 class="text-xl font-medium">Skapa ett quiz</h1>
    <p class="mt-1 text-sm text-muted-foreground mb-6">
      Vi väljer automatiskt ett slumpat urval tentor. Justera urvalet om du
      vill.
    </p>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div class="flex-1 min-w-0">
        <p
          class="mb-2 text-[10px] font-medium uppercase text-muted-foreground/60"
        >
          Urval av tentor
        </p>

        <div
          v-if="examsLoading"
          class="rounded-md border border-border/50 overflow-hidden p-4 space-y-2"
        >
          <div class="h-4 w-36 rounded bg-muted animate-pulse" />
          <div class="h-3 w-full rounded bg-muted animate-pulse" />
          <div class="h-3 w-4/5 rounded bg-muted animate-pulse" />
        </div>

        <div
          v-else-if="availableExams.length === 0"
          class="text-sm text-muted-foreground"
        >
          Inga tentor hittades med PDF.
        </div>

        <div
          v-else
          class="rounded-md border border-border/50 bg-background p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p v-if="isClientReady" class="text-sm font-medium">
                {{ selectedCount }} av {{ MAX_SELECTION }} valda
              </p>
              <p v-else class="text-sm font-medium">Laddar urval...</p>
              <p class="mt-1 text-xs text-muted-foreground/70">
                Slumpat urval används som standard. Öppna listan för att välja
                själv.
              </p>
            </div>
            <Dialog v-model:open="isExamDialogOpen">
              <DialogTrigger as-child>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  class="shrink-0"
                >
                  Välj tentor
                </Button>
              </DialogTrigger>

              <DialogContent
                class="sm:max-w-2xl p-0 overflow-hidden"
                :show-close-button="false"
              >
                <div
                  class="p-4 border-b border-border/50 flex items-center justify-between gap-2"
                >
                  <div>
                    <DialogTitle>Välj tentor</DialogTitle>
                    <DialogDescription>
                      Välj upp till {{ MAX_SELECTION }} tentor som quizet ska
                      baseras på.
                    </DialogDescription>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    @click="randomize"
                  >
                    <LucideShuffle class="h-3.5 w-3.5 mr-1.5" />
                    Slumpa
                  </Button>
                </div>

                <div class="max-h-[60vh] overflow-y-auto">
                  <button
                    v-for="exam in availableExams"
                    :key="exam.id"
                    type="button"
                    :disabled="
                      !selectedIds.has(exam.id) &&
                      selectedCount >= MAX_SELECTION
                    "
                    class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="selectedIds.has(exam.id) ? 'bg-muted/30' : ''"
                    @click="toggleExam(exam.id)"
                  >
                    <span
                      class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                      :class="
                        selectedIds.has(exam.id)
                          ? 'bg-foreground border-foreground'
                          : 'border-border bg-background'
                      "
                    >
                      <svg
                        v-if="selectedIds.has(exam.id)"
                        viewBox="0 0 12 12"
                        class="h-2.5 w-2.5 stroke-background fill-none stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]"
                      >
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    </span>
                    <span
                      class="w-24 shrink-0 font-medium tabular-nums text-xs"
                      >{{ exam.exam_date ?? "—" }}</span
                    >
                    <span class="flex-1 text-xs text-muted-foreground truncate">
                      {{
                        (exam.exam_name ?? "")
                          .replace(exam.exam_date ?? "", "")
                          .trim() || exam.exam_name
                      }}
                    </span>
                    <span
                      v-if="exam.has_solution"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0"
                    >
                      Facit
                    </span>
                  </button>
                </div>

                <div
                  class="p-4 border-t border-border/50 flex items-center justify-between"
                >
                  <p class="text-xs text-muted-foreground/60">
                    {{ selectedCount }} av {{ MAX_SELECTION }} valda
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    @click="isExamDialogOpen = false"
                  >
                    Klar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div
            v-if="isClientReady && selectedExams.length > 0"
            class="mt-3 flex flex-wrap gap-2"
          >
            <span
              v-for="exam in selectedExams"
              :key="exam.id"
              class="inline-flex items-center rounded-md border border-border/60 px-2 py-1 text-[11px] text-muted-foreground"
            >
              {{ exam.exam_date ?? exam.exam_name }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-20 flex flex-col gap-4"
      >
        <div>
          <p
            class="mb-2 text-[10px] font-medium uppercase text-muted-foreground/60"
          >
            Anpassa (valfritt)
          </p>
          <div class="rounded-md border border-border/50 bg-background p-3">
            <textarea
              v-model="customPrompt"
              :maxlength="MAX_PROMPT_LENGTH"
              placeholder="t.ex. Fokusera på frågor om minneshantering och pekare..."
              rows="3"
              class="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 leading-relaxed"
            />
            <div
              class="flex items-center justify-between pt-2 border-t border-border/40 mt-1"
            >
              <span class="text-[10px] text-muted-foreground/50"
                >Styr AI:n i en viss riktning</span
              >
              <span
                class="text-[10px] tabular-nums"
                :class="
                  customPrompt.length > MAX_PROMPT_LENGTH * 0.9
                    ? 'text-destructive'
                    : 'text-muted-foreground/40'
                "
              >
                {{ customPrompt.length }} / {{ MAX_PROMPT_LENGTH }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Button
            size="sm"
            :disabled="!canGenerate"
            class="w-full gap-1.5"
            @click="handleGenerate"
          >
            Generera quiz
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="w-full gap-1.5 border-border/50 shadow-none"
            @click="randomize"
          >
            <LucideShuffle class="h-3.5 w-3.5" />
            Slumpa urval
          </Button>
        </div>

        <p class="text-[10px] text-muted-foreground/40 leading-relaxed">
          Beta — AI-genererade frågor kan innehålla fel.
        </p>
      </div>
    </div>
  </div>
</template>
