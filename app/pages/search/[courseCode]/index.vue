<script setup lang="ts">
definePageMeta({ layout: "search" });

const route = useRoute();
const courseCode = route.params.courseCode as string;

const { data, status } = useFetch(`/api/exams/${courseCode}`);

interface Exam {
  id: number;
  exam_name: string;
  exam_date: string;
  has_solution: boolean;
  pass_rate: number;
  statistics: Record<string, number>;
  pdf_url: string;
  course_code: string;
}

const courseData = computed(() => (data.value as any)?.data);
const exams = computed<Exam[]>(() => courseData.value?.exams ?? []);

watchEffect(() => {
  if (courseData.value) {
    useSeoMeta({
      title: `${courseCode} - ${courseData.value.courseName}`,
      description: `Plugga ${exams.value.length} tentor för ${courseCode} - ${courseData.value.courseName}`,
    });
    return;
  }

  if (status.value === "success") {
    useSeoMeta({
      title: `${courseCode} - Inga tentor hittades`,
      description: `Inga tentor hittades för ${courseCode}. Var den första att ladda upp tentor.`,
    });
  }
});

const sortOrder = ref<"asc" | "desc">("desc");
const activeFilters = ref<Set<string>>(new Set());

const prefixes = computed(() => {
  const all = exams.value.map((e) => e.exam_name.split(" ")[0]);
  return [...new Set(all)] as string[];
});

const sortedExams = computed<Exam[]>(() => {
  return [...exams.value].sort((a, b) => {
    const diff =
      new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime();
    return sortOrder.value === "desc" ? diff : -diff;
  });
});

const filteredExams = computed<Exam[]>(() => {
  if (activeFilters.value.size === 0) return sortedExams.value;
  return sortedExams.value.filter((e) =>
    activeFilters.value.has(e.exam_name.split(" ")[0] ?? ""),
  );
});

function toggleFilter(p: string) {
  const next = new Set(activeFilters.value);
  next.has(p) ? next.delete(p) : next.add(p);
  activeFilters.value = next;
}

function passBarColor(rate: number) {
  if (rate >= 50) return "bg-green-500";
  if (rate >= 30) return "bg-amber-500";
  return "bg-red-500";
}

function passColor(rate: number) {
  if (rate >= 50) return "text-green-500";
  if (rate >= 30) return "text-amber-500";
  return "text-red-500";
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div
      v-if="status === 'pending'"
      class="flex items-center justify-center min-h-[60vh]"
    >
      <LucideLoader2 class="w-6 h-6 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="status === 'success' && !courseData"
      class="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4"
    >
      <LucideInbox class="w-10 h-10 text-muted-foreground" />
      <div>
        <p class="text-sm font-medium text-foreground">Inga tentor hittades</p>
        <p class="text-xs text-muted-foreground mt-1">
          Var den första att ladda upp tentor för {{ courseCode }}!
        </p>
      </div>
      <NuxtLink to="/upload-exams">
        <Button variant="default" size="sm">
          <LucideUpload class="w-4 h-4" />
          Ladda upp tenta
        </Button>
      </NuxtLink>
    </div>

    <template v-else-if="courseData">
      <div class="flex justify-center">
        <div class="flex flex-col items-start w-full max-w-2xl">
          <div class="mb-6 w-full">
            <div class="text-xs text-muted-foreground font-mono mb-1">
              {{ courseCode }} / Tentor
            </div>
            <h1
              class="text-2xl font-semibold text-foreground whitespace-normal wrap-break-word leading-tight w-full"
            >
              {{ courseData.courseName }}
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              {{ exams.length }} tentor
            </p>
          </div>

          <div
            v-if="prefixes.length > 1"
            class="flex flex-wrap gap-2 mb-4 w-full"
          >
            <button
              v-for="p in prefixes"
              :key="p"
              class="text-xs cursor-pointer font-mono px-3 py-1 rounded-md border transition-colors"
              :class="
                activeFilters.has(p)
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-dashed border-border text-muted-foreground hover:text-foreground'
              "
              @click="toggleFilter(p)"
            >
              {{ p }}
            </button>
          </div>

          <div class="w-full overflow-x-auto rounded-xl">
            <div
              class="min-w-fit w-full border border-border/50 rounded-xl overflow-hidden"
            >
              <div
                class="grid grid-cols-[1fr_80px_64px_72px] px-4 py-2 border-b border-border/30 bg-muted/40"
              >
                <div
                  class="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                  @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
                >
                  Tentamen
                  <LucideArrowDownWideNarrow
                    v-if="sortOrder === 'asc'"
                    class="w-3.5 h-3.5"
                  />
                  <LucideArrowUpWideNarrow
                    v-if="sortOrder === 'desc'"
                    class="w-3.5 h-3.5"
                  />
                </div>
                <div class="text-xs text-muted-foreground">Typ</div>
                <div class="text-xs text-muted-foreground text-center">
                  Facit
                </div>
                <div class="text-xs text-muted-foreground text-right">
                  Godkänd
                </div>
              </div>

              <div
                v-for="exam in filteredExams"
                :key="exam.id"
                class="grid grid-cols-[1fr_80px_64px_72px] cursor-pointer px-4 py-3 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors items-center"
                @click="navigateTo(`/search/${courseCode}/${exam.id}`)"
              >
                <div>
                  <div class="text-sm font-medium text-foreground">
                    {{ exam.exam_name }}
                  </div>
                  <div class="text-xs font-mono text-muted-foreground mt-0.5">
                    {{ exam.exam_date }}
                  </div>
                </div>

                <div>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded border border-dashed border-border text-muted-foreground"
                  >
                    {{ exam.exam_name.split(" ")[0] }}
                  </span>
                </div>

                <div class="flex justify-center">
                  <LucideCircleCheck
                    v-if="exam.has_solution"
                    class="w-4 h-4 text-green-600 dark:text-green-400"
                  />
                  <LucideCircleX v-else class="w-4 h-4 text-muted-foreground" />
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
      </div>

      <div class="sticky bottom-0 z-50 pointer-events-none">
        <div
          class="bg-linear-to-t from-background via-background/80 to-transparent pt-8 pb-10"
        >
          <div
            class="flex items-center justify-center gap-2 pointer-events-auto"
          >
            <NuxtLink to="/upload-exams">
              <Button variant="default" size="sm">
                <LucideUpload class="w-4.5 h-4.5" />
                Ladda upp
              </Button>
            </NuxtLink>
            <NuxtLink :to="`/search/${courseCode}/stats`">
              <Button variant="outline" size="sm">
                <LucideChartPie class="w-4.5 h-4.5" />
                Statistik
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
