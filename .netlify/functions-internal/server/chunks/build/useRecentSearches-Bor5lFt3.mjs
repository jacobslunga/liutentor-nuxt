import { u as useCookie } from './cookie-CWJ58jSV.mjs';
import { computed } from 'vue';

const COURSE_CODE_REGEX = /^[A-Z0-9]{6}$/;
function useRecentSearches() {
  const cookie = useCookie("recentSearches", {
    default: () => [],
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
  });
  function add(courseCode) {
    const code = courseCode.toUpperCase();
    if (!COURSE_CODE_REGEX.test(code)) return;
    const withoutCurrent = (cookie.value ?? []).filter(
      (s) => s.courseCode !== code
    );
    cookie.value = [
      { courseCode: code, timestamp: Date.now() },
      ...withoutCurrent
    ].slice(0, 5);
  }
  const latest = computed(
    () => [...cookie.value ?? []].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3)
  );
  return { latest, add };
}

export { useRecentSearches as u };
//# sourceMappingURL=useRecentSearches-Bor5lFt3.mjs.map
