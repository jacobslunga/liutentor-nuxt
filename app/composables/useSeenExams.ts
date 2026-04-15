const SEEN_DELAY_MS = 10 * 60 * 1000;

interface SeenEntry {
  examId: string;
  seenAt: number;
}

export function useSeenExams() {
  const cookie = useCookie<SeenEntry[]>("seenExams", {
    default: () => [],
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  const seenIds = computed(
    () => new Set((cookie.value ?? []).map((e) => e.examId)),
  );

  function markSeen(examId: string) {
    if (seenIds.value.has(examId)) return;
    cookie.value = [...(cookie.value ?? []), { examId, seenAt: Date.now() }];
  }

  function isSeenExam(examId: string | number) {
    return seenIds.value.has(String(examId));
  }

  function getSeenAt(examId: string | number): number | null {
    return (
      (cookie.value ?? []).find((e) => e.examId === String(examId))?.seenAt ??
      null
    );
  }

  return { seenIds, markSeen, isSeenExam, getSeenAt };
}

/**
 * Call this inside the exam page. Starts a timer that marks the exam as seen
 * after SEEN_DELAY_MS. Resets if examId changes (e.g. navigating between exams).
 */
export function useSeenExamTimer(examId: Ref<string>) {
  const { markSeen } = useSeenExams();
  let timer: ReturnType<typeof setTimeout> | null = null;

  function startTimer(id: string) {
    clearTimer();
    if (!id) return;
    timer = setTimeout(() => markSeen(id), SEEN_DELAY_MS);
  }

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  onMounted(() => startTimer(examId.value));
  onUnmounted(clearTimer);
  watch(examId, (newId) => startTimer(newId));
}
