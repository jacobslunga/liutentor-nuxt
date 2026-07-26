import { courseTag, setCdnCache } from "../../utils/cache";

export default defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");

  // Cached at the edge and purged per course when exams are published, so a
  // publish is visible within seconds without paying the Cloud Run round trip
  // on every request.
  if (courseCode) setCdnCache(e, [courseTag(courseCode)]);

  try {
    const data = await $fetch(
      `https://liutentor-go-687405545415.europe-west1.run.app/v1/exams/LIU/${courseCode}`,
    );
    return data;
  } catch (err: any) {
    if (err?.status === 404) {
      return { data: null };
    }
    throw err;
  }
});
