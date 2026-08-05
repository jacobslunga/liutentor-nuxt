<script setup lang="ts">
import type { Exam } from "~/types/exam";

const props = defineProps<{
  exams: Exam[];
}>();

const {
  series,
  grades,
  totalStudents,
  overallPassRate,
  hasPassRateData,
  hasGradeData,
  hasAnyData,
} = useCourseStats(() => props.exams);

// The average the plotline marks. Counting students rather than averaging the
// per-exam percentages, so a 12-student retake doesn't weigh as much as a
// 300-student main sitting.
const average = computed(() => overallPassRate.value ?? 0);
</script>

<template>
  <CourseStatsEmpty
    v-if="!hasAnyData"
    title="Ingen statistik för den här kursen"
    body="Vi har inga betygsfördelningar eller godkändprocent för kursens tentor. Statistiken hämtas från Y-Sektionen och saknas för en del kurser."
  />

  <div v-else class="flex w-full flex-col gap-12">
    <section class="flex flex-col gap-5">
      <header>
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Godkända över tid
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Andel godkända per tentatillfälle
        </p>
      </header>

      <ClientOnly v-if="hasPassRateData">
        <CourseStatsPassRate :points="series" :average="average" />
        <template #fallback>
          <CourseStatsLoading class="h-[300px]" />
        </template>
      </ClientOnly>
      <CourseStatsEmpty
        v-else
        title="Ingen godkändprocent registrerad"
        body="Vi saknar godkändprocent för kursens tentor."
      />
    </section>

    <section class="flex flex-col gap-5">
      <header>
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Betygsfördelning
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Alla registrerade betyg på kursens tentor
        </p>
      </header>

      <ClientOnly v-if="hasGradeData">
        <CourseStatsGrades :grades="grades" :total="totalStudents" />
        <template #fallback>
          <CourseStatsLoading class="h-[260px]" />
        </template>
      </ClientOnly>
      <CourseStatsEmpty
        v-else
        title="Ingen betygsfördelning registrerad"
        body="Vi saknar betygsfördelning för kursens tentor."
      />
    </section>
  </div>
</template>
