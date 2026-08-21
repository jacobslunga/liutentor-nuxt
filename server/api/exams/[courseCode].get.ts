import { GO_API_URL } from "../../utils/api";
import { courseTag, setCdnCache } from "../../utils/cache";

export default defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");

  if (courseCode) setCdnCache(e, [courseTag(courseCode)]);

  try {
    const data = await $fetch(`${GO_API_URL}/v1/exams/LIU/${courseCode}`);
    return data;
  } catch (err: any) {
    if (err?.status === 404) {
      return { data: null };
    }
    throw err;
  }
});
