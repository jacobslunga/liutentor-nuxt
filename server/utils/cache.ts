import type { H3Event } from "h3";

/**
 * Netlify cache tag for everything belonging to one course: the course page,
 * its exam detail pages, and the API response behind them. Purging this tag
 * invalidates all of them at once.
 */
export function courseTag(courseCode: string) {
  return `course-${courseCode.trim().toUpperCase()}`;
}

export const SITEMAP_TAG = "sitemap";

/**
 * Cache a response on Netlify's edge until it is explicitly purged.
 *
 * `s-maxage` is a one-day backstop rather than the primary mechanism — new
 * exams normally go live within seconds via the purge triggered by the
 * Supabase webhook in `server/api/revalidate.post.ts`. The backstop only
 * matters if a purge is ever missed.
 *
 * Browsers are told to always revalidate, so a purge is visible immediately
 * rather than being masked by a private browser cache.
 */
export function setCdnCache(event: H3Event, tags: string[]) {
  setHeader(event, "Cache-Control", "public, max-age=0, must-revalidate");
  setHeader(
    event,
    "Netlify-CDN-Cache-Control",
    "public, durable, s-maxage=86400, stale-while-revalidate=60",
  );
  setHeader(event, "Netlify-Cache-Tag", tags.join(","));
}
