<script setup lang="ts">
import type { Exam } from "~/types/exam";

definePageMeta({ layout: "search" });

const route = useRoute();
const courseCode = computed(() => (route.params.courseCode as string) ?? "");

const { add: addRecentSearch } = useRecentSearches();
watch(
  courseCode,
  (code) => {
    if (code) addRecentSearch(code);
  },
  { immediate: true },
);

// Resolved during SSR so the course content and its metadata end up in the
// server-rendered HTML rather than only after client-side hydration.
const { data, status } = useFetch(() => `/api/exams/${courseCode.value}`, {
  key: () => `course-exams-${courseCode.value}`,
});

const courseData = computed(() => (data.value as any)?.data);
const exams = computed<Exam[]>(() => courseData.value?.exams ?? []);
const activeTab = ref("exams");
const { open: openUploadModal } = useUploadModal();

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

// ─── SEO ──────────────────────────────────────────────────────
// Called unconditionally at setup (never inside a watcher) so unhead resolves
// them during SSR. Reactive getters keep them correct across client-side
// navigation between course codes.

const courseName = computed<string>(() => courseData.value?.courseName ?? "");
const canonicalUrl = computed(
  () => `https://liutentor.se/search/${courseCode.value}`,
);
const hasExams = computed(() => exams.value.length > 0);

/** Range of years the archive covers, e.g. "2013–2026". */
const examYears = computed(() => {
  const years = exams.value
    .map((e) => Number(e.exam_date?.slice(0, 4)))
    .filter((y) => Number.isFinite(y) && y > 1990);
  if (!years.length) return null;
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? `${min}` : `${min}–${max}`;
});

/** Newest exam date — used as the page's freshness signal for crawlers. */
const lastExamDate = computed(() => {
  const dates = exams.value.map((e) => e.exam_date).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
});

// Course code first: that is the query users actually type.
const seoTitle = computed(() => {
  const code = courseCode.value;
  if (!hasExams.value) return `${code} – gamla tentor`;
  return `${code} tentor & facit – ${courseName.value}`;
});

const seoDescription = computed(() => {
  const code = courseCode.value;
  if (!hasExams.value) {
    return `Vi saknar gamla tentor för ${code} vid Linköpings universitet. Ladda upp en tenta eller ett facit och hjälp nästa student som söker på ${code}.`;
  }
  const lead =
    examsWithSolutions.value > 0
      ? `${exams.value.length} gamla tentor varav ${examsWithSolutions.value} med facit`
      : `${exams.value.length} gamla tentor`;
  const facts: string[] = [];
  if (examYears.value) facts.push(`Tentor från ${examYears.value}`);
  if (avgPassRate.value !== null) {
    facts.push(`${avgPassRate.value} % godkända i snitt`);
  }
  const tail = facts.length ? ` ${facts.join(", ")}.` : "";
  return `${lead} för ${code} – ${courseName.value} vid Linköpings universitet.${tail}`;
});

const jsonLd = computed(() => {
  const code = courseCode.value;
  const url = canonicalUrl.value;

  const graph: Record<string, any>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Hem",
          item: "https://liutentor.se",
        },
        { "@type": "ListItem", position: 2, name: code, item: url },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: seoTitle.value,
      description: seoDescription.value,
      inLanguage: "sv",
      ...(lastExamDate.value ? { dateModified: lastExamDate.value } : {}),
      isPartOf: {
        "@type": "WebSite",
        name: "LiU Tentor",
        url: "https://liutentor.se",
      },
    },
  ];

  if (hasExams.value) {
    graph.push({
      "@type": "Course",
      "@id": `${url}#course`,
      name: `${code} – ${courseName.value}`,
      courseCode: code,
      description: seoDescription.value,
      url,
      inLanguage: "sv",
      provider: {
        "@type": "CollegeOrUniversity",
        name: "Linköpings universitet",
        url: "https://liu.se",
      },
    });

    // Surfaces the individual exam pages to crawlers from the course page.
    graph.push({
      "@type": "ItemList",
      name: `Gamla tentor för ${code}`,
      numberOfItems: exams.value.length,
      itemListElement: exams.value.map((exam, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${code} ${exam.exam_name}`,
        url: `${url}/${exam.id}`,
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
});

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: "website",
  ogUrl: () => canonicalUrl.value,
  ogSiteName: "LiU Tentor",
  ogLocale: "sv_SE",
  ogImage: "https://liutentor.se/logo.svg",
  twitterCard: "summary",
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  // Courses with no exams are thin content — keep them out of the index but
  // let crawlers follow the upload links.
  robots: () => (hasExams.value ? "index, follow" : "noindex, follow"),
});

useHead(() => ({
  // Override the global "LiU Tentor | %s" so the course code leads the title.
  titleTemplate: "%s | LiU Tentor",
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(jsonLd.value),
    },
  ],
}));

function passColor(rate: number) {
  if (rate >= 50) return "text-success";
  if (rate >= 30) return "text-warning";
  return "text-destructive";
}
</script>

<template>
  <div class="container mx-auto max-w-3xl px-4 pb-8 pt-2 md:py-8">
    <div class="sticky top-0 z-50 bg-background h-12 pt-2 mb-4 md:hidden">
      <CourseSearchDropdown size="md" class="mx-auto w-full max-w-xl" />
    </div>

    <div v-if="status === 'pending'" class="flex items-center justify-center min-h-[60vh]">
      <LucideLoader2 class="w-6 h-6 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="status === 'success' && !courseData"
      class="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-8 py-8">
      <div class="max-w-xl text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
      <ExamUploadForm :initial-course-code="courseCode" fixed-course-code :show-heading="false" />
    </div>

    <template v-else-if="courseData">
      <div class="flex justify-center">
        <div class="flex flex-col items-start w-full max-w-4xl gap-8">
          <div class="w-full">
            <h1 class="text-3xl sm:text-4xl font-semibold text-foreground leading-tight w-full wrap-break-word">
              {{ courseData.courseName }}
            </h1>

            <p class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span class="font-sans text-sm text-muted-foreground">{{ courseCode }}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span class="font-medium text-foreground">{{
                  exams.length
                }}</span>
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
              class="sticky top-12 z-40 flex flex-col gap-3 border-b border-border/60 bg-background pt-2 pb-2.5 sm:flex-row sm:items-center sm:justify-between md:top-0 dark:border-border/60">
              <TabsList>
                <TabsTrigger value="exams" class="h-full font-medium text-xs gap-2">
                  <LucideScrollText class="w-4 h-4" />
                  Tentor
                </TabsTrigger>
                <TabsTrigger value="stats" class="h-full font-medium text-xs gap-2">
                  <LucideChartSpline class="w-4 h-4" />
                  Statistik
                </TabsTrigger>
              </TabsList>

              <div class="flex items-center gap-2">
                <Button variant="default" @click="openUploadModal(courseCode)">
                  <LucideUpload class="w-4 h-4" />
                  Ladda upp
                </Button>
                <Button variant="outline" as-child>
                  <NuxtLink :to="`/quiz/${courseCode}`">
                    <LucideLayers class="w-4 h-4" />
                    Quiz
                  </NuxtLink>
                </Button>
              </div>
            </div>

            <Transition name="tab-panel" mode="out-in">
              <TabsContent v-if="activeTab === 'exams'" key="exams" value="exams" class="mt-5">
                <CourseExamsTable :course-code="courseCode" :exams="exams" />
              </TabsContent>

              <TabsContent v-else key="stats" value="stats" class="mt-5">
                <LazyCourseStats :exams="exams" />
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
    opacity var(--duration-fast) var(--ease-spring),
    transform var(--duration-fast) var(--ease-spring);
}

.tab-panel-enter-from,
.tab-panel-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
