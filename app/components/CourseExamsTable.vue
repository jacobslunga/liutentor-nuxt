<script setup lang="ts">
import type { Exam } from "~/types/exam";

const props = defineProps<{
  courseCode: string;
  exams: Exam[];
  sortBy?: "date" | "pass-rate";
  sortDirection?: "asc" | "desc";
}>();

const activeFilters = ref<Set<string>>(new Set());
const prefetchedRoutes = new Set<string>();

function getExamPrefix(exam: Exam): string {
  if (!exam?.exam_name) return "";
  const firstWord = exam.exam_name.trim().split(" ")[0] ?? "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(firstWord)) return "";
  return firstWord;
}

const prefixes = computed(() => {
  const all = props.exams.map((e) => getExamPrefix(e)).filter(Boolean);
  return [...new Set(all)];
});

const sortedExams = computed<Exam[]>(() => {
  return [...props.exams].sort((a, b) => {
    if (props.sortBy === "pass-rate") {
      const aHasRate =
        Number.isFinite(Number(a.pass_rate)) && Number(a.pass_rate) > 0;
      const bHasRate =
        Number.isFinite(Number(b.pass_rate)) && Number(b.pass_rate) > 0;
      if (aHasRate !== bHasRate) return aHasRate ? -1 : 1;

      if (aHasRate && bHasRate) {
        const rateDiff = Number(a.pass_rate) - Number(b.pass_rate);
        if (rateDiff !== 0) {
          return props.sortDirection === "asc" ? rateDiff : -rateDiff;
        }
      }
    } else {
      const dateDiff = a.exam_date.localeCompare(b.exam_date);
      if (dateDiff !== 0) {
        return props.sortDirection === "asc" ? dateDiff : -dateDiff;
      }
    }

    const dateDiff = b.exam_date.localeCompare(a.exam_date);
    if (dateDiff !== 0) return dateDiff;
    return (a.exam_name ?? "").localeCompare(b.exam_name ?? "");
  });
});

const filteredExams = computed<Exam[]>(() => {
  let result = sortedExams.value;
  if (activeFilters.value.size > 0) {
    result = result.filter((e) => activeFilters.value.has(getExamPrefix(e)));
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

const gridCols =
  "grid grid-cols-[minmax(max-content,1fr)_max-content_max-content_max-content] sm:grid-cols-[minmax(0,3fr)_minmax(80px,1fr)_minmax(64px,1fr)_minmax(88px,1fr)] items-center gap-x-4 px-4";

function toggleFilter(p: string) {
  const next = new Set(activeFilters.value);
  next.has(p) ? next.delete(p) : next.add(p);
  activeFilters.value = next;
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div v-if="prefixes.length > 1" class="flex flex-wrap gap-2 w-full">
      <Button v-for="p in prefixes" :key="p" :variant="activeFilters.has(p) ? 'default' : 'outline'" size="sm"
        @click="toggleFilter(p)">
        {{ p }}
      </Button>
    </div>

    <div class="w-full overflow-x-auto rounded-2xl border border-border">

      <div class="w-max min-w-full sm:w-full rounded-2xl overflow-hidden">
        <div :class="gridCols" class="py-3 border-b border-border/60 bg-muted/30">
          <div class="text-xs text-muted-foreground">Tentamen</div>
          <div class="text-xs text-muted-foreground">Typ</div>
          <div class="text-xs text-muted-foreground text-center">Facit</div>
          <div class="text-xs text-muted-foreground text-right">Godkänd</div>
        </div>

        <div v-for="exam in filteredExams" :key="exam.id" :class="gridCols"
          class="cursor-pointer py-2.5 border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors group"
          @mouseenter="prefetchExamRoute(exam.id)" @focusin="prefetchExamRoute(exam.id)"
          @click="navigateTo(examRoutePath(exam.id))">

          <div class="sm:min-w-0">
            <div
              class="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors whitespace-nowrap sm:truncate">
              {{ exam.exam_name }}
            </div>
            <div class="text-xs text-muted-foreground/70 mt-0.5 whitespace-nowrap">
              {{ exam.exam_date }}
            </div>
          </div>

          <div>
            <span v-if="getExamPrefix(exam)"
              class="text-2xs px-2 py-0.5 rounded-md border border-border bg-muted/40 text-muted-foreground font-mono">
              {{ getExamPrefix(exam) }}
            </span>
          </div>

          <div class="flex justify-center">
            <LucideCheck v-if="exam.has_solution" class="w-4 h-4 text-success" />
            <LucideMinus v-else class="w-4 h-4 text-muted-foreground/30" />
          </div>

          <div class="text-right flex flex-col items-end gap-1">
            <ExamStatsDialog :statistics="exam.statistics" :date="exam.exam_date" :pass-rate="exam.pass_rate" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
