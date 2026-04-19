import type { MultipleChoiceQuizResponse, StoredQuizItem } from "@/types/quiz";

export function useQuizHistory(courseCode: Ref<string>) {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const allHistory = ref<StoredQuizItem[]>([]);

  function cleanupLegacyQuizHistoryStorage() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("liutentor.quiz.history.v2");
    localStorage.removeItem("liutentor.quiz.history");

    const legacyCookieV2 = useCookie<string | null>(
      "liutentor.quiz.history.v2",
    );
    const legacyCookie = useCookie<string | null>("liutentor.quiz.history");
    legacyCookieV2.value = null;
    legacyCookie.value = null;
  }

  function normalizeCourse(value: string) {
    return value.trim().toUpperCase();
  }

  async function refresh() {
    const userId = (user.value as any)?.id ?? (user.value as any)?.sub;
    const currentCourseCode = normalizeCourse(courseCode.value);

    if (!userId || !currentCourseCode) {
      allHistory.value = [];
      return;
    }

    const { data, error } = await (supabase as any)
      .from("ai_quiz_logs")
      .select(
        "id, created_at, quiz, source_count, source_exam_ids, course_code, model",
      )
      .eq("user_id", userId)
      .eq("course_code", currentCourseCode)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
      allHistory.value = [];
      return;
    }

    allHistory.value = data
      .filter((row) => row?.id && row?.created_at && row?.quiz)
      .map((row) => {
        const quiz = row.quiz as MultipleChoiceQuizResponse;

        const normalizedQuiz: MultipleChoiceQuizResponse = {
          ...quiz,
          meta: {
            sourceCount: quiz?.meta?.sourceCount ?? row.source_count ?? 0,
            sourceExamIds:
              quiz?.meta?.sourceExamIds ?? row.source_exam_ids ?? [],
            courseCode:
              quiz?.meta?.courseCode ?? row.course_code ?? currentCourseCode,
            model: quiz?.meta?.model ?? row.model ?? "okand-modell",
          },
        };

        return {
          id: row.id,
          createdAt: row.created_at,
          data: normalizedQuiz,
        };
      });
  }

  const courseHistory = computed(() => allHistory.value);

  function findById(id: string) {
    return allHistory.value.find((item) => item.id === id) ?? null;
  }

  watch(
    [courseCode, user],
    () => {
      refresh();
    },
    { immediate: true },
  );

  onMounted(() => {
    cleanupLegacyQuizHistoryStorage();
  });

  return { courseHistory, findById, refresh };
}
