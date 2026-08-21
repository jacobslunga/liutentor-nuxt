export type Course = {
  code: string;
  name: string;
  examCount: number;
};

/**
 * The list of LiU course codes that actually have exams in the archive.
 *
 * Fetched rather than bundled: the archive grows, and a committed snapshot both
 * went stale and offered thousands of codes whose course pages were empty.
 *
 * `server: false` matters — `/` is prerendered, so a server-side fetch would
 * bake today's list into the build and never refresh it. The request is shared
 * by `key`, so several search inputs on one page make one call between them.
 */
export function useCourseCodes() {
  const { data, pending, error } = useFetch<{ courses: Course[] }>(
    "/api/courses",
    {
      key: "course-index",
      server: false,
      default: () => ({ courses: [] }),
    },
  );

  const courses = computed(() => data.value?.courses ?? []);
  const codes = computed(() => courses.value.map((course) => course.code));
  const nameByCode = computed(
    () => new Map(courses.value.map((course) => [course.code, course.name])),
  );

  return { courses, codes, nameByCode, pending, error };
}
