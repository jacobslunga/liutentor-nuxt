import { courseTag, setCdnCache } from "../../../utils/cache";

export default defineEventHandler(async (event) => {
  const examId = getRouterParam(event, "examId");

  const data = await $fetch<any>(
    `https://liutentor-go-687405545415.europe-west1.run.app/v1/exams/${examId}`,
  );

  // The course code is only known from the response, so tag after fetching —
  // headers are still applied before the body is sent.
  const code = data?.data?.exam?.course_code ?? data?.data?.course_code;
  if (code) setCdnCache(event, [courseTag(String(code))]);

  return data;
});
