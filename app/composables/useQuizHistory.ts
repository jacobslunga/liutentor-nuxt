import type {
  MultipleChoiceQuizResponse,
  QuizDifficulty,
  StoredQuizItem,
} from "@/types/quiz";
import { QUIZ_DIFFICULTIES } from "@/types/quiz";

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

  // Quizzes generated before difficulty existed have no value on the row, and
  // the column is plain text, so anything unrecognised is dropped rather than
  // shown as a level the app does not have.
  function normalizeDifficulty(value: unknown): QuizDifficulty | undefined {
    return QUIZ_DIFFICULTIES.includes(value as QuizDifficulty)
      ? (value as QuizDifficulty)
      : undefined;
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
        "id, created_at, quiz, source_count, source_exam_ids, course_code, model, difficulty",
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
            difficulty:
              normalizeDifficulty(quiz?.meta?.difficulty) ??
              normalizeDifficulty(row.difficulty),
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

  async function remove(id: string) {
    const userId = (user.value as any)?.id ?? (user.value as any)?.sub;
    if (!userId) return false;

    const previous = allHistory.value;
    allHistory.value = previous.filter((item) => item.id !== id);

    // `.select()` matters: when RLS filters a delete, PostgREST reports no
    // error and simply affects no rows, so the returned rows are the only
    // way to tell a real delete from a silent no-op.
    const { data, error } = await (supabase as any)
      .from("ai_quiz_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (error || !Array.isArray(data) || data.length === 0) {
      allHistory.value = previous;
      return false;
    }

    return true;
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

  return { courseHistory, findById, refresh, remove };
}
