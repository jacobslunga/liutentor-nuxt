import { defineStore } from "pinia";
import type {
  MultipleChoiceQuizResponse,
  StoredQuizItem,
  GenerateQuizPayload,
} from "@/types/quiz";

const QUIZ_API_BASE =
  "https://liutentor-hono-687405545415.europe-north2.run.app/api/v1/quiz";

function getAnonymousId(): string {
  if (typeof window === "undefined") return "unknown";
  const key = "liutentor_anonymous_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export type Stage = "setup" | "generating" | "answering" | "results";
export type QuizStatus = { step: string; message: string };

export const useQuizStore = defineStore("quiz", () => {
  const stage = ref<Stage>("setup");
  const quizData = ref<MultipleChoiceQuizResponse | null>(null);
  // null = freshly generated (no DB id yet), string = loaded from history
  const activeQuizId = ref<string | null>(null);
  // incremented on retake/load so QuizAnswering remounts and resets its internal answers
  const sessionKey = ref(0);
  const currentIndex = ref(0);
  const answers = ref<Record<number, number>>({});
  const isGenerating = ref(false);
  const generationError = ref<string | null>(null);
  const generationStatus = ref<QuizStatus | null>(null);

  let abortController: AbortController | null = null;

  const questionCount = computed(
    () => quizData.value?.quiz.questions.length ?? 0,
  );

  async function generate(courseCode: string, payload: GenerateQuizPayload) {
    abortController?.abort();
    abortController = new AbortController();

    stage.value = "generating";
    isGenerating.value = true;
    generationError.value = null;
    generationStatus.value = null;
    quizData.value = null;
    activeQuizId.value = null;
    answers.value = {};
    currentIndex.value = 0;
    sessionKey.value++;

    try {
      const { getAuthHeaders } = useAuthHeaders();
      const authHeaders = await getAuthHeaders();

      const response = await fetch(
        `${QUIZ_API_BASE}/multiple-choice/${courseCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-anonymous-user-id": getAnonymousId(),
            ...authHeaders,
          },
          body: JSON.stringify(payload),
          signal: abortController.signal,
        },
      );

      if (!response.ok)
        throw new Error(`Request failed: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const eventMatch = part.match(/^event: (\w+)/m);
          const dataMatch = part.match(/^data: (.+)/m);
          if (!eventMatch || !dataMatch?.[1]) continue;

          const eventType = eventMatch[1];
          const parsed = JSON.parse(dataMatch[1]);

          if (eventType === "status") {
            generationStatus.value = parsed;
          } else if (eventType === "result") {
            quizData.value = parsed;
            isGenerating.value = false;
            stage.value = "answering";
          } else if (eventType === "error") {
            generationError.value = parsed.message ?? "Unknown error";
            isGenerating.value = false;
          }
        }
      }

      if (isGenerating.value) {
        isGenerating.value = false;
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        generationError.value = err?.message ?? "Failed to generate quiz";
      }
      isGenerating.value = false;
    }
  }

  function loadFromHistory(item: StoredQuizItem) {
    abortController?.abort();
    abortController = null;
    quizData.value = item.data;
    activeQuizId.value = item.id;
    sessionKey.value++;
    currentIndex.value = 0;
    answers.value = {};
    isGenerating.value = false;
    generationError.value = null;
    generationStatus.value = null;
    stage.value = "answering";
  }

  function complete(submittedAnswers: Record<number, number>) {
    answers.value = submittedAnswers;
    stage.value = "results";
  }

  function retake() {
    sessionKey.value++;
    currentIndex.value = 0;
    answers.value = {};
    stage.value = "answering";
  }

  function reset() {
    abortController?.abort();
    abortController = null;
    stage.value = "setup";
    quizData.value = null;
    activeQuizId.value = null;
    sessionKey.value = 0;
    currentIndex.value = 0;
    answers.value = {};
    isGenerating.value = false;
    generationError.value = null;
    generationStatus.value = null;
  }

  function abort() {
    abortController?.abort();
    abortController = null;
    isGenerating.value = false;
  }

  function next(hasAnsweredCurrent: boolean) {
    if (!hasAnsweredCurrent) return;
    currentIndex.value = Math.min(
      currentIndex.value + 1,
      questionCount.value - 1,
    );
  }

  function previous() {
    if (currentIndex.value > 0) currentIndex.value--;
  }

  return {
    stage,
    quizData,
    activeQuizId,
    sessionKey,
    currentIndex,
    answers,
    isGenerating,
    generationError,
    generationStatus,
    questionCount,
    generate,
    loadFromHistory,
    complete,
    retake,
    reset,
    abort,
    next,
    previous,
  };
});
