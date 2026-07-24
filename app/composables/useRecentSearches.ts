const COURSE_CODE_REGEX = /^[A-Z0-9]{6}$/;

interface RecentSearch {
  courseCode: string;
  timestamp: number;
}

export function useRecentSearches() {
  const cookie = useCookie<RecentSearch[]>("recentSearches", {
    default: () => [],
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  function add(courseCode: string) {
    const code = courseCode.toUpperCase();
    if (!COURSE_CODE_REGEX.test(code)) return;

    const currentList = Array.isArray(cookie.value) ? cookie.value : [];
    const withoutCurrent = currentList.filter(
      (s) => (typeof s === "string" ? s : s?.courseCode) !== code,
    );

    const updated = [
      { courseCode: code, timestamp: Date.now() },
      ...withoutCurrent.map((item) =>
        typeof item === "string"
          ? { courseCode: item, timestamp: Date.now() }
          : item,
      ),
    ].slice(0, 3); // Strictly store max 3 course codes

    cookie.value = updated;
  }

  const latest = computed(() =>
    (Array.isArray(cookie.value) ? cookie.value : [])
      .map((item) =>
        typeof item === "string"
          ? { courseCode: item, timestamp: 0 }
          : item,
      )
      .filter((item) => item?.courseCode)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3),
  );

  return { latest, add };
}
