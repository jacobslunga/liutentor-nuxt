const COURSE_CODE_REGEX = /^[A-Z0-9]{4,8}$/;

interface RecentSearch {
  courseCode: string;
  timestamp: number;
}

export function useRecentSearches() {

  const legacyCookie = useCookie("recentSearches");
  if (legacyCookie.value !== null && legacyCookie.value !== undefined) {
    legacyCookie.value = null;
  }

  const cookie = useCookie<RecentSearch[] | undefined>("liu_recent_searches_v2", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  function add(courseCode: string) {
    if (!courseCode) return;
    const code = courseCode.toUpperCase().trim();
    if (!COURSE_CODE_REGEX.test(code)) return;

    const currentList = Array.isArray(cookie.value) ? cookie.value : [];
    const withoutCurrent = currentList.filter(
      (s) => (typeof s === "string" ? s : s?.courseCode) !== code,
    );

    const updated: RecentSearch[] = [
      { courseCode: code, timestamp: Date.now() },
      ...withoutCurrent.map((item) =>
        typeof item === "string"
          ? { courseCode: item, timestamp: Date.now() }
          : item,
      ),
    ].slice(0, 3);

    cookie.value = updated;
  }

  const latest = computed(() => {
    if (!Array.isArray(cookie.value) || cookie.value.length === 0) return [];
    return cookie.value
      .map((item) =>
        typeof item === "string"
          ? { courseCode: item, timestamp: 0 }
          : item,
      )
      .filter((item) => item?.courseCode)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  });

  function clear() {
    cookie.value = [];
  }

  return { latest, add, clear };
}
