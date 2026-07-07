<script setup lang="ts">
import type { Exam } from "~/types/exam";

const props = defineProps<{
  courseCode: string;
  exams: Exam[];
}>();

const sortOrder = ref<"asc" | "desc">("desc");
const activeFilters = ref<Set<string>>(new Set());
const prefetchedRoutes = new Set<string>();

const prefixes = computed(() => {
  const all = props.exams.map((e) => e.exam_name.split(" ")[0]);
  return [...new Set(all)] as string[];
});

const sortedExams = computed<Exam[]>(() => {
  return [...props.exams].sort((a, b) => {
    const diff =
      new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime();
    return sortOrder.value === "desc" ? diff : -diff;
  });
});

const filteredExams = computed<Exam[]>(() => {
  let result = sortedExams.value;
  if (activeFilters.value.size > 0) {
    result = result.filter((e) =>
      activeFilters.value.has(e.exam_name.split(" ")[0] ?? ""),
    );
  }
  return result;
});

function examRoutePath(examId: number) {
  return `/search/${props.courseCode}/${examId}`;
}

function prefetchExamRoute(examId: number) {
  if (import.meta.server) return;
  const path = examRoutePath(examId);
  if (prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);
  void preloadRouteComponents(path);
}

function toggleFilter(p: string) {
  const next = new Set(activeFilters.value);
  next.has(p) ? next.delete(p) : next.add(p);
  activeFilters.value = next;
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div v-if="prefixes.length > 1" class="flex flex-wrap gap-2 w-full">
      <Button
        v-for="p in prefixes"
        :key="p"
        variant="outline"
        size="sm"
        class="font-mono text-xs"
        :class="
          activeFilters.has(p)
            ? 'bg-foreground text-background border-foreground shadow-sm'
            : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
        "
        @click="toggleFilter(p)"
      >
        {{ p }}
      </Button>
    </div>

    <div class="w-full overflow-x-auto rounded-2xl border border-border/60">
      <div class="min-w-fit w-full rounded-2xl overflow-hidden">
        <div
          class="grid grid-cols-[1fr_80px_64px_80px] gap-x-4 px-6 py-3.5 border-b border-border/50 bg-muted/30"
        >
          <Button
            variant="ghost"
            size="sm"
            class="text-xs text-muted-foreground hover:text-foreground"
            @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
          >
            Tentamen
            <LucideArrowDownWideNarrow class="w-3.5 h-3.5" />
          </Button>
          <div class="text-xs text-muted-foreground">Typ</div>
          <div class="text-xs text-muted-foreground text-center">Facit</div>
          <div class="text-xs text-muted-foreground text-right">Godkänd</div>
        </div>

        <div
          v-for="exam in filteredExams"
          :key="exam.id"
          class="grid grid-cols-[1fr_80px_64px_80px] gap-x-4 cursor-pointer px-3 py-2 border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors items-center group"
          @mouseenter="prefetchExamRoute(exam.id)"
          @focusin="prefetchExamRoute(exam.id)"
          @click="navigateTo(examRoutePath(exam.id))"
        >
          <div class="min-w-0">
            <div
              class="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors truncate"
            >
              {{ exam.exam_name }}
            </div>
            <div class="text-xs text-muted-foreground/70 mt-0.5">
              {{ exam.exam_date }}
            </div>
          </div>

          <div>
            <span
              class="text-[10px] px-2 py-0.5 rounded-md border border-border/50 bg-muted/40 text-muted-foreground font-mono"
            >
              {{ exam.exam_name.split(" ")[0] }}
            </span>
          </div>

          <div class="flex justify-center">
            <LucideCheck
              v-if="exam.has_solution"
              class="w-4 h-4 text-green-500"
            />
            <LucideMinus v-else class="w-4 h-4 text-muted-foreground/30" />
          </div>

          <div class="text-right flex flex-col items-end gap-1">
            <ExamStatsDialog
              :statistics="exam.statistics"
              :date="exam.exam_date"
              :pass-rate="exam.pass_rate"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
