import { courseTag, setCdnCache } from "../utils/cache";

const COURSE_ROUTE = /^\/search\/([A-Za-z0-9]+)(?:\/(\d+))?\/?$/;

export default defineEventHandler((event) => {
  const path = (event.path || "").split("?")[0] as string;
  const match = COURSE_ROUTE.exec(path);
  if (!match) return;

  setCdnCache(event, [courseTag(match[1]!)]);
});
