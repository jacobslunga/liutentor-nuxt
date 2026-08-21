import { COURSES_TAG, setCdnCache } from "../utils/cache";
import { getCourseIndex, type CourseIndexResponse } from "../utils/courses";

export default defineEventHandler(
  async (event): Promise<CourseIndexResponse> => {
    setCdnCache(event, [COURSES_TAG]);
    return { courses: await getCourseIndex() };
  },
);
