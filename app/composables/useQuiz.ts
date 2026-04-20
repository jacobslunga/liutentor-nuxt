import type { MultipleChoiceQuizResponse } from "@/types/quiz";

const QUIZ_API_BASE =
  "https://liutentor-api-production.up.railway.app/api/v1/quiz";

// USE FOR LOCAL DEVELOPMENT
// const QUIZ_API_BASE_LOCAL = "http://localhost:3001/api/v1/quiz";

function getAnonymousId(): string {
  if (typeof window === "undefined") return "unknown";
  const key = "liutentor_anonymous_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export type QuizStatus = {
  step: string;
  message: string;
};

export function useQuiz(courseCode: Ref<string>) {
  const { getAuthHeaders } = useAuthHeaders();
  const quizData = ref<MultipleChoiceQuizResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const status = ref<QuizStatus | null>(null);
  let abortController: AbortController | null = null;

  async function generateQuiz(payload: {
    examIds: number[];
    customPrompt?: string;
  }) {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    isLoading.value = true;
    error.value = null;
    quizData.value = null;
    status.value = null;

    try {
      const authHeaders = await getAuthHeaders();

      const response = await fetch(
        `${QUIZ_API_BASE}/multiple-choice/${courseCode.value}`,
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

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

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
          if (!eventMatch || !dataMatch || !dataMatch[1]) continue;

          const eventType = eventMatch[1];
          const parsed = JSON.parse(dataMatch[1]);

          if (eventType === "status") {
            status.value = parsed;
          } else if (eventType === "result") {
            quizData.value = parsed;
            isLoading.value = false;
          } else if (eventType === "error") {
            error.value = parsed.message ?? "Unknown error";
            isLoading.value = false;
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        error.value = err?.message ?? "Failed to generate quiz";
      }
      isLoading.value = false;
    }
  }

  function reset() {
    abortController?.abort();
    abortController = null;
    quizData.value = null;
    isLoading.value = false;
    error.value = null;
    status.value = null;
  }

  onUnmounted(() => {
    abortController?.abort();
  });

  return { quizData, isLoading, error, status, generateQuiz, reset };
}
