import { courseTag, setCdnCache } from "../../../utils/cache";

interface ExamDetailResponse {
  data?: {
    exam?: { course_code?: string };
    course_code?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default defineEventHandler(async (event): Promise<ExamDetailResponse> => {
  const examId = getRouterParam(event, "examId");

  const data = await $fetch<ExamDetailResponse>(
    `https://liutentor-go-687405545415.europe-west1.run.app/v1/exams/${examId}`,
  );

  const code = data?.data?.exam?.course_code ?? data?.data?.course_code;
  if (code) setCdnCache(event, [courseTag(String(code))]);

  return data;
});
