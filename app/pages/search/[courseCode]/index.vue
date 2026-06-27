<script setup lang="ts">
import type { Exam } from "~/types/exam";

definePageMeta({ layout: "search" });

const route = useRoute();
const courseCode = route.params.courseCode as string;

const { data, status } = useFetch(`/api/exams/${courseCode}`);

const courseData = computed(() => (data.value as any)?.data);
const exams = computed<Exam[]>(() => courseData.value?.exams ?? []);
const activeTab = ref("exams");

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

const avgPassRate = computed(() => {
  const valid = exams.value.filter((e) => e.pass_rate != null);
  if (!valid.length) return null;
  return Math.round(
    valid.reduce((sum, e) => sum + e.pass_rate, 0) / valid.length,
  );
});

const examsWithSolutions = computed(
  () => exams.value.filter((e) => e.has_solution).length,
);

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
      class="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-8 py-8"
    >
      <div class="max-w-xl text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        >
          <LucideInbox class="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 class="text-2xl font-medium text-foreground">
          Vi saknar tentor för {{ courseCode }}
        </h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Har du en gammal tenta eller ett facit? Ladda upp den här så blir
          nästa student som söker på {{ courseCode }} hjälpt direkt.
        </p>
      </div>
      <ExamUploadForm
        :initial-course-code="courseCode"
        fixed-course-code
        :show-heading="false"
      />
    </div>

    <template v-else-if="courseData">
      <div class="flex justify-center">
        <div class="flex flex-col items-start w-full max-w-4xl gap-8">
          <div class="w-full">
            <h1
              class="text-3xl sm:text-4xl font-semibold text-foreground leading-tight w-full wrap-break-word"
            >
              {{ courseData.courseName }}
            </h1>

            <p
              class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
            >
              <span class="font-mono font-medium text-foreground">{{
                courseCode
              }}</span>
              <span aria-hidden="true">·</span>
              <span>
                <span class="font-medium text-foreground">{{ exams.length }}</span>
                tentor
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span class="font-medium text-foreground">{{
                  examsWithSolutions
                }}</span>
                med facit
              </span>
              <template v-if="avgPassRate !== null">
                <span aria-hidden="true">·</span>
                <span>
                  <span class="font-medium" :class="passColor(avgPassRate)">
                    {{ avgPassRate }}%
                  </span>
                  godkända i snitt
                </span>
              </template>
            </p>
          </div>

          <Tabs v-model="activeTab" class="w-full -mt-4">
            <div
              class="sticky top-0 z-40 flex flex-col gap-3 border-b border-border/70 bg-background pt-2 sm:flex-row sm:items-end sm:justify-between dark:border-border/60"
            >
              <TabsList
                class="h-auto justify-start rounded-none border-0 bg-transparent p-0"
              >
                <TabsTrigger
                  value="exams"
                  class="relative h-10 cursor-pointer flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 text-sm text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent"
                >
                  <LucideScrollText class="w-4 h-4" />
                  Tentor
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  class="relative h-10 cursor-pointer flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2 text-sm text-muted-foreground shadow-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent"
                >
                  <LucideChartSpline class="w-4 h-4" />
                  Statistik
                </TabsTrigger>
              </TabsList>

              <div class="flex items-center gap-2 pb-2">
                <Button variant="default" size="sm" as-child>
                  <NuxtLink to="/upload-exams">
                    <LucideUpload class="w-4.5 h-4.5" />
                    Ladda upp
                  </NuxtLink>
                </Button>
                <Button variant="outline" size="sm" as-child>
                  <NuxtLink :to="`/quiz/${courseCode}`">
                    <LucideLayers class="w-4.5 h-4.5" />
                    Quiz
                  </NuxtLink>
                </Button>
              </div>
            </div>

            <Transition name="tab-panel" mode="out-in">
              <TabsContent
                v-if="activeTab === 'exams'"
                key="exams"
                value="exams"
                class="mt-5"
              >
                <CourseExamsTable :course-code="courseCode" :exams="exams" />
              </TabsContent>

              <TabsContent v-else key="stats" value="stats" class="mt-5">
                <CourseStats :exams="exams" />
              </TabsContent>
            </Transition>
          </Tabs>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tab-panel-enter-active,
.tab-panel-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
