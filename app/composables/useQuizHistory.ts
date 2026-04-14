import type { MultipleChoiceQuizResponse, StoredQuizItem } from "@/types/quiz";

const STORAGE_KEY = "liutentor.quiz.history.v2";
const MAX_ITEMS = 30;

export function useQuizHistory(courseCode: Ref<string>) {
  const allHistory = ref<StoredQuizItem[]>([]);

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) allHistory.value = parsed;
    } catch {
      allHistory.value = [];
    }
  }

  function save(data: MultipleChoiceQuizResponse): StoredQuizItem {
    const entry: StoredQuizItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      data,
    };
    const next = [entry, ...allHistory.value].slice(0, MAX_ITEMS);
    allHistory.value = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return entry;
  }

  const courseHistory = computed(() =>
    allHistory.value.filter(
      (item) =>
        item.data.meta.courseCode.toUpperCase() ===
        courseCode.value.toUpperCase(),
    ),
  );

  function findById(id: string) {
    return allHistory.value.find((item) => item.id === id) ?? null;
  }

  onMounted(load);

  return { courseHistory, save, findById };
}
