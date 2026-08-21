import { GO_API_URL } from "./api";

export type Course = {
  code: string;
  name: string;
  examCount: number;
};

export type CourseIndexResponse = {
  courses: Course[];
};

/**
 * How long a resolved course index is trusted inside one server instance.
 *
 * The Go service caches for an hour and the CDN for a day, so this only exists
 * to stop a single burst of guesses — six requests in a minute or two — from
 * each making its own upstream call.
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

let cached: { courses: Course[]; at: number } | null = null;

export async function getCourseIndex(): Promise<Course[]> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.courses;

  let courses: Course[] = [];

  try {
    const res = await $fetch<{ data?: CourseIndexResponse }>(
      `${GO_API_URL}/v1/courses/LIU`,
    );
    courses = res?.data?.courses ?? [];
  } catch (err: any) {
    // A redeploying Go service, or a local dev setup without one running,
    // should degrade to an empty course list rather than throw an opaque
    // FetchError out of whatever route happened to ask first.
    console.error(
      `[courses] ${GO_API_URL}/v1/courses/LIU failed (${err?.status ?? "?"}). ` +
        "Set NUXT_GO_API_URL to a running Go service for local development.",
    );
  }

  // Keep serving a stale index rather than breaking the puzzle if the upstream
  // list ever comes back empty.
  if (!courses.length) return cached?.courses ?? [];

  cached = { courses, at: Date.now() };
  return courses;
}
