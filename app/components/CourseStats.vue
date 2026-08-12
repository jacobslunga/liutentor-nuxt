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

const average = computed(() => overallPassRate.value ?? 0);
</script>

<template>
  <CourseStatsEmpty v-if="!hasAnyData" title="Ingen statistik för den här kursen"
    body="Vi har inga betygsfördelningar eller godkändprocent för kursens tentor. Statistiken hämtas från Y-Sektionen och saknas för en del kurser." />

  <div v-else class="flex w-full flex-col gap-12">
    <section class="flex flex-col gap-5">
      <header>
        <h2 class="text-xs font-semibold text-muted-foreground">
          Godkända över tid
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Andel godkända per tentatillfälle
        </p>
      </header>

      <ClientOnly v-if="hasPassRateData">
        <CourseStatsPassRate :points="series" :average="average" />
        <template #fallback>
          <CourseStatsLoading class="h-75" />
        </template>
      </ClientOnly>
      <CourseStatsEmpty v-else title="Ingen godkändprocent registrerad"
        body="Vi saknar godkändprocent för kursens tentor." />
    </section>

    <section class="flex flex-col gap-5">
      <header>
        <h2 class="text-xs font-semibold text-muted-foreground">
          Betygsfördelning
        </h2>
        <p class="mt-1.5 text-sm text-muted-foreground">
          Alla registrerade betyg på kursens tentor
        </p>
      </header>

      <ClientOnly v-if="hasGradeData">
        <CourseStatsGrades :grades="grades" :total="totalStudents" />
        <template #fallback>
          <CourseStatsLoading variant="distribution" />
        </template>
      </ClientOnly>
      <CourseStatsEmpty v-else title="Ingen betygsfördelning registrerad"
        body="Vi saknar betygsfördelning för kursens tentor." />
    </section>
  </div>
</template>
