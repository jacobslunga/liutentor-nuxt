import { courseTag, setCdnCache } from "../utils/cache";

/** /search/TATA91 and /search/TATA91/19443 — but not /search alone. */
const COURSE_ROUTE = /^\/search\/([A-Za-z0-9]+)(?:\/(\d+))?\/?$/;

/**
 * Tags rendered course pages so they can be cached on Netlify's edge and
 * purged per course when exams are published. The tag has to be applied here
 * rather than through `routeRules` because it depends on the course code.
 */
export default defineEventHandler((event) => {
  const path = (event.path || "").split("?")[0];
  const match = COURSE_ROUTE.exec(path);
  if (!match) return;

  setCdnCache(event, [courseTag(match[1]!)]);
});
