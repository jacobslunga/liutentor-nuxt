import type { ChartToken } from "./useChartTokens";
import type { Exam } from "~/types/exam";

/** Grades in the order they are displayed — strongest result first. */
const GRADE_ORDER = ["VG", "5", "4", "3", "G", "U"] as const;

/**
 * Grades are an ordered scale, so the pass grades wear a single-hue ordinal
 * ramp and the fail grade wears the reserved status red.
 *
 * The mapping is fixed per grade rather than assigned by rank at render time:
 * a course that only awards 3 and 5 must not repaint 5 just because 4 is
 * missing. `G`/`VG` and `3`/`4`/`5` belong to different grading scales and
 * never appear on the same course, so sharing the ramp steps is unambiguous.
 */
const GRADE_TOKENS: Record<string, ChartToken> = {
  U: "grade-fail",
  "3": "grade-low",
  G: "grade-mid",
  "4": "grade-mid",
  VG: "grade-high",
  "5": "grade-high",
};

export interface PassRatePoint {
  timestamp: number;
  /** `undefined` draws a gap rather than interpolating across a missing exam. */
  rate: number | undefined;
  date: string;
  names: string[];
  students: number;
}

export interface GradeEntry {
  key: string;
  value: number;
  pct: number;
  token: ChartToken;
}

function studentCount(exam: Exam) {
  return Object.values(exam.statistics ?? {}).reduce(
    (sum, n) => sum + Number(n || 0),
    0,
  );
}

export function useCourseStats(exams: MaybeRefOrGetter<Exam[]>) {
  const sorted = computed(() =>
    [...toValue(exams)].sort((a, b) => {
      const diff =
        new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
      return diff !== 0 ? diff : a.exam_name.localeCompare(b.exam_name);
    }),
  );

  /**
   * One point per exam date, not per exam. Two exams sharing a date would
   * otherwise put two y-values on the same x and draw a vertical spike through
   * the line; averaging them — weighted by cohort size where we know it — keeps
   * the series a function of time.
   */
  const series = computed<PassRatePoint[]>(() => {
    const byDate = new Map<string, Exam[]>();
    for (const exam of sorted.value) {
      const date = exam.exam_date.slice(0, 10);
      byDate.set(date, [...(byDate.get(date) ?? []), exam]);
    }

    return [...byDate].map(([date, group]) => {
      // A pass rate of exactly 0 is how the scrape represents "not recorded",
      // so those exams contribute no point rather than a floor-hugging one.
      const measured = group.filter((e) => Number(e.pass_rate ?? 0) > 0);
      const students = group.reduce((sum, e) => sum + studentCount(e), 0);
      const weight = measured.reduce((sum, e) => sum + studentCount(e), 0);

      const rate = measured.length
        ? weight > 0
          ? measured.reduce(
              (sum, e) => sum + Number(e.pass_rate) * studentCount(e),
              0,
            ) / weight
          : measured.reduce((sum, e) => sum + Number(e.pass_rate), 0) /
            measured.length
        : undefined;

      return {
        timestamp: new Date(date).getTime(),
        rate,
        date,
        names: group.map((e) => e.exam_name),
        students,
      };
    });
  });

  const grades = computed<GradeEntry[]>(() => {
    const totals = new Map<string, number>();
    for (const exam of sorted.value) {
      for (const [key, count] of Object.entries(exam.statistics ?? {})) {
        if (!(key in GRADE_TOKENS)) continue;
        totals.set(key, (totals.get(key) ?? 0) + Number(count || 0));
      }
    }

    const total = [...totals.values()].reduce((sum, n) => sum + n, 0);

    return GRADE_ORDER.filter((key) => (totals.get(key) ?? 0) > 0).map(
      (key) => ({
        key,
        value: totals.get(key) ?? 0,
        pct: total ? ((totals.get(key) ?? 0) / total) * 100 : 0,
        token: GRADE_TOKENS[key] as ChartToken,
      }),
    );
  });

  const totalStudents = computed(() =>
    grades.value.reduce((sum, g) => sum + g.value, 0),
  );

  const measuredPoints = computed(() =>
    series.value.filter((p) => p.rate !== undefined),
  );

  const hasPassRateData = computed(() => measuredPoints.value.length > 0);
  const hasGradeData = computed(() => totalStudents.value > 0);
  const hasAnyData = computed(() => hasPassRateData.value || hasGradeData.value);

  /**
   * Counting students beats averaging the per-exam percentages: a 12-student
   * retake would otherwise weigh as much as a 300-student main sitting. The
   * percentage average is only the fallback for courses that have pass rates
   * but no grade breakdown.
   */
  const overallPassRate = computed(() => {
    if (hasGradeData.value) {
      const failed = grades.value.find((g) => g.key === "U")?.value ?? 0;
      return ((totalStudents.value - failed) / totalStudents.value) * 100;
    }
    if (!hasPassRateData.value) return undefined;
    return (
      measuredPoints.value.reduce((sum, p) => sum + (p.rate ?? 0), 0) /
      measuredPoints.value.length
    );
  });

  return {
    sorted,
    series,
    measuredPoints,
    grades,
    totalStudents,
    overallPassRate,
    hasPassRateData,
    hasGradeData,
    hasAnyData,
  };
}
