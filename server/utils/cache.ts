import type { H3Event } from "h3";

export function courseTag(courseCode: string) {
  return `course-${courseCode.trim().toUpperCase()}`;
}

export const SITEMAP_TAG = "sitemap";

export function setCdnCache(event: H3Event, tags: string[]) {
  setHeader(event, "Cache-Control", "public, max-age=0, must-revalidate");
  setHeader(
    event,
    "Netlify-CDN-Cache-Control",
    "public, durable, s-maxage=86400, stale-while-revalidate=60",
  );
  setHeader(event, "Netlify-Cache-Tag", tags.join(","));
}
