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

const selectedCount = computed(() => selectedIds.value.size);
const canGenerate = computed(
  () => selectedCount.value > 0 && !props.isLoading && !props.examsLoading,
);

function toggleExam(id: number) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else if (selectedIds.value.size < MAX_SELECTION) {
    selectedIds.value.add(id);
  }
}

function randomize() {
  const withPdf = props.exams.filter((e) => e.pdf_url);
  const shuffled = [...withPdf].sort(() => Math.random() - 0.5);
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
    <h1 class="text-xl font-medium tracking-tight">Skapa ett quiz</h1>
    <p class="mt-1 text-sm text-muted-foreground mb-6">
      Välj upp till 5 tentor att generera frågor från.
    </p>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div class="flex-1 min-w-0">
        <p
          class="mb-2 text-[10px] font-medium uppercase tracking-[.15em] text-muted-foreground/60"
        >
          Tentor
        </p>

        <div
          v-if="examsLoading"
          class="rounded-xl border border-border/50 overflow-hidden"
        >
          <div
            v-for="i in 7"
            :key="i"
            class="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 last:border-b-0"
          >
            <div class="h-4 w-4 shrink-0 rounded bg-muted animate-pulse" />
            <div class="h-3 w-20 rounded bg-muted animate-pulse" />
            <div class="h-3 flex-1 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div
          v-else-if="exams.length === 0"
          class="text-sm text-muted-foreground"
        >
          Inga tentor hittades med PDF.
        </div>

        <div v-else class="rounded-xl border border-border/50 overflow-hidden">
          <div class="max-h-100 overflow-y-auto">
            <button
              v-for="exam in exams"
              :key="exam.id"
              type="button"
              :disabled="
                !selectedIds.has(exam.id) && selectedCount >= MAX_SELECTION
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
              <span class="w-24 shrink-0 font-medium tabular-nums text-xs">{{
                exam.exam_date ?? "—"
              }}</span>
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
        </div>

        <p class="mt-2 text-[11px] text-muted-foreground/50">
          {{ selectedCount }} av {{ MAX_SELECTION }} valda
          <span class="mx-1">·</span>
          <button
            type="button"
            class="underline hover:text-muted-foreground transition-colors"
            @click="randomize"
          >
            Slumpa
          </button>
        </p>
      </div>

      <div
        class="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-20 flex flex-col gap-4"
      >
        <div>
          <p
            class="mb-2 text-[10px] font-medium uppercase tracking-[.15em] text-muted-foreground/60"
          >
            Anpassa (valfritt)
          </p>
          <div class="rounded-xl border border-border/50 bg-background p-3">
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
