<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
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

const { data, status } = useFetch(() => `/api/exams/${courseCode.value}`, {
  key: () => `course-exams-${courseCode.value}`,
});

const { track } = usePageLoading();
track(status);

const courseData = computed(() => (data.value as any)?.data);
const exams = computed<Exam[]>(() => courseData.value?.exams ?? []);
const router = useRouter();
const COURSE_TABS = ["exams", "stats", "quiz"];
const { sortBy: examSortBy, sortDirection: examSortDirection } =
  useExamSortPreference("course-page");
const examSortLabel = computed(() =>
  examSortBy.value === "date" ? "Datum" : "Godkänd",
);

function setExamSortBy(value: unknown) {
  if (value === "date" || value === "pass-rate") examSortBy.value = value;
}

function setExamSortDirection(value: unknown) {
  if (value === "asc" || value === "desc") examSortDirection.value = value;
}

// Två grupper med kryssposter i stället för radiogrupper — dropdownen i
// Nuxt UI har ingen radiovariant, men bara ett val per grupp sätts åt gången.
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
      checked: examSortBy.value === option.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) setExamSortBy(option.value);
      },
      onSelect: (event: Event) => event.preventDefault(),
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
      checked: examSortDirection.value === option.value,
      onUpdateChecked: (checked: boolean) => {
        if (checked) setExamSortDirection(option.value);
      },
      onSelect: (event: Event) => event.preventDefault(),
    })),
  ],
]);

function tabFromQuery(value: unknown) {
  return typeof value === "string" && COURSE_TABS.includes(value)
    ? value
    : "exams";
}

const activeTab = ref(tabFromQuery(route.query.tab));

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = tabFromQuery(tab);
  },
);

// Keep the tab in the URL so it can be linked/refreshed, without a navigation.
watch(activeTab, (tab) => {
  if (tabFromQuery(route.query.tab) === tab) return;
  const query = { ...route.query };
  if (tab === "exams") delete query.tab;
  else query.tab = tab;
  router.replace({ query });
});
const { open: openUploadModal } = useUploadModal();

const { overallPassRate } = useCourseStats(() => exams.value);

const avgPassRate = computed(() =>
  overallPassRate.value === undefined
    ? null
    : Math.round(overallPassRate.value),
);

const examsWithSolutions = computed(
  () => exams.value.filter((e) => e.has_solution).length,
);

const courseName = computed<string>(() => courseData.value?.courseName ?? "");
const canonicalUrl = computed(
  () => `https://liutentor.se/search/${courseCode.value}`,
);
const hasExams = computed(() => exams.value.length > 0);

const examYears = computed(() => {
  const years = exams.value
    .map((e) => Number(e.exam_date?.slice(0, 4)))
    .filter((y) => Number.isFinite(y) && y > 1990);
  if (!years.length) return null;
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? `${min}` : `${min}–${max}`;
});

const lastExamDate = computed(() => {
  const dates = exams.value
    .map((e) => e.exam_date)
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
});

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

  robots: () => (hasExams.value ? "index, follow" : "noindex, follow"),
});

useHead(() => ({
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
  return "text-error";
}
</script>

<template>
  <div class="container mx-auto max-w-3xl px-4 pb-8 pt-2 md:py-8">
    <div class="sticky top-0 z-30 bg-default h-12 pt-2 mb-4 md:hidden">
      <CourseSearchDropdown size="md" class="mx-auto w-full max-w-xl" />
    </div>

    <div v-if="status === 'pending'" class="flex items-center justify-center min-h-[60vh]">
      <UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin text-muted" />
    </div>

    <div v-else-if="status === 'success' && !courseData"
      class="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-8 py-8">
      <div class="max-w-xl text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <UIcon name="i-lucide-inbox" class="h-6 w-6 text-muted" />
        </div>
        <h1 class="text-2xl font-medium text-highlighted">
          Vi saknar tentor för {{ courseCode }}
        </h1>
        <p class="mt-2 text-sm text-muted">
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
            <h1 class="text-3xl sm:text-4xl font-semibold text-highlighted leading-tight w-full wrap-break-word">
              {{ courseData.courseName }}
            </h1>

            <p class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <span class="font-sans text-sm text-muted">{{ courseCode }}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span class="font-medium text-highlighted">{{
                  exams.length
                  }}</span>
                tentor
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <span class="font-medium text-highlighted">{{
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

          <div class="flex flex-col gap-2 w-full -mt-4">
            <CourseTabsBar v-model="activeTab">
              <template #controls>
                <UDropdownMenu v-if="activeTab === 'exams'" :items="sortItems" :content="{ align: 'start' }">
                  <UButton color="neutral" variant="outline" aria-label="Sortera tentor">
                    <UIcon name="i-lucide-arrow-left-right" class="size-4" />
                    {{ examSortLabel }}
                    <UIcon name="i-lucide-arrow-down" v-if="examSortDirection === 'desc'" class="size-3.5 text-muted" />
                    <UIcon name="i-lucide-arrow-up" v-else class="size-3.5 text-muted" />
                  </UButton>
                </UDropdownMenu>
              </template>
              <template #actions>
                <UButton @click="openUploadModal(courseCode)">
                  <UIcon name="i-lucide-upload" class="w-4 h-4" />
                  Ladda upp
                </UButton>
              </template>
            </CourseTabsBar>

            <Transition name="tab-panel" mode="out-in">
              <div v-if="activeTab === 'exams'" key="exams" class="mt-5">
                <CourseExamsTable :course-code="courseCode" :exams="exams" :sort-by="examSortBy"
                  :sort-direction="examSortDirection" />
              </div>

              <div v-else-if="activeTab === 'stats'" key="stats" class="mt-5">
                <Suspense>
                  <LazyCourseStats :exams="exams" />
                  <template #fallback>
                    <CourseStatsSkeleton />
                  </template>
                </Suspense>
              </div>

              <div v-else key="quiz" class="mt-5">
                <CourseQuizPanel :course-code="courseCode" :exams="exams" />
              </div>
            </Transition>
          </div>
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
