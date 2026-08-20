export type ExamSortBy = "date" | "pass-rate";
export type ExamSortDirection = "asc" | "desc";

interface ExamSortPreference {
  sortBy: ExamSortBy;
  sortDirection: ExamSortDirection;
}

const COOKIE_NAMES = {
  "exam-picker": "liutentor_exam_picker_sort",
  "course-page": "liutentor_course_page_sort",
} as const;

const DEFAULT_PREFERENCE: ExamSortPreference = {
  sortBy: "date",
  sortDirection: "desc",
};

function normalizePreference(value: unknown): ExamSortPreference {
  const preference = value as Partial<ExamSortPreference> | null | undefined;

  return {
    sortBy:
      preference?.sortBy === "date" || preference?.sortBy === "pass-rate"
        ? preference.sortBy
        : DEFAULT_PREFERENCE.sortBy,
    sortDirection:
      preference?.sortDirection === "asc" ||
      preference?.sortDirection === "desc"
        ? preference.sortDirection
        : DEFAULT_PREFERENCE.sortDirection,
  };
}

export function useExamSortPreference(
  scope: keyof typeof COOKIE_NAMES,
) {
  const cookie = useCookie<ExamSortPreference>(COOKIE_NAMES[scope], {
    default: () => ({ ...DEFAULT_PREFERENCE }),
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const sortBy = computed<ExamSortBy>({
    get: () => normalizePreference(cookie.value).sortBy,
    set: (value) => {
      cookie.value = {
        ...normalizePreference(cookie.value),
        sortBy: value,
      };
    },
  });

  const sortDirection = computed<ExamSortDirection>({
    get: () => normalizePreference(cookie.value).sortDirection,
    set: (value) => {
      cookie.value = {
        ...normalizePreference(cookie.value),
        sortDirection: value,
      };
    },
  });

  return { sortBy, sortDirection };
}
