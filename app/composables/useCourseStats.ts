import type { Exam } from "~/types/exam";

const GRADE_ORDER = ["VG", "5", "4", "3", "G", "U"] as const;

export type GradeToken =
  | "grade-fail"
  | "grade-high"
  | "grade-low"
  | "grade-mid";

const GRADE_TOKENS: Record<string, GradeToken> = {
  U: "grade-fail",
  "3": "grade-low",
  G: "grade-mid",
  "4": "grade-mid",
  VG: "grade-high",
  "5": "grade-high",
};

export interface PassRatePoint {
  timestamp: number;

  rate: number | undefined;
  date: string;
  names: string[];
  students: number;
}

export interface GradeEntry {
  key: string;
  value: number;
  pct: number;
  token: GradeToken;
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

  const series = computed<PassRatePoint[]>(() => {
    const byDate = new Map<string, Exam[]>();
    for (const exam of sorted.value) {
      const date = exam.exam_date.slice(0, 10);
      byDate.set(date, [...(byDate.get(date) ?? []), exam]);
    }

    return [...byDate].map(([date, group]) => {

      // Upstream uses a zero pass rate to represent "not recorded".
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
        token: GRADE_TOKENS[key]!,
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
