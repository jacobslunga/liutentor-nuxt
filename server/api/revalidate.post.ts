import { courseTag, SITEMAP_TAG } from "../utils/cache";

type WebhookBody = {
  type?: string;
  table?: string;
  record?: Record<string, any> | null;
  old_record?: Record<string, any> | null;
  courseCodes?: string[];
};

type ExamDetailResponse = {
  data?: {
    exam?: { course_code?: string };
  };
};

const EXAM_API_URL =
  "https://liutentor-go-687405545415.europe-west1.run.app/v1/exams";

async function resolveCourseCode(examId: number) {
  const data = await $fetch<ExamDetailResponse>(
    `${EXAM_API_URL}/${encodeURIComponent(String(examId))}`,
  );

  return data?.data?.exam?.course_code;
}

async function purgeTags(tags: string[]) {
  const token = process.env.NETLIFY_PURGE_API_TOKEN;
  const siteId = process.env.SITE_ID;

  if (!token || !siteId) {
    throw createError({
      statusCode: 500,
      message:
        "Netlify purge credentials unavailable (NETLIFY_PURGE_API_TOKEN / SITE_ID)",
    });
  }

  await $fetch("https://api.netlify.com/api/v1/purge", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: { site_id: siteId, cache_tags: tags },
  });
}

export default defineEventHandler(async (event) => {
  const expected = useRuntimeConfig().revalidateSecret;

  if (!expected) {
    throw createError({
      statusCode: 500,
      message: "NUXT_REVALIDATE_SECRET is not configured",
    });
  }

  const provided = getHeader(event, "x-revalidate-secret");
  if (provided !== expected) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody<WebhookBody>(event);

  const codes = new Set<string>();
  const examIds = new Set<number>();

  for (const code of body?.courseCodes ?? []) {
    if (code) codes.add(String(code).trim().toUpperCase());
  }

  for (const row of [body?.record, body?.old_record]) {
    const code = row?.course_code;
    if (code) codes.add(String(code).trim().toUpperCase());

    if (body?.table === "solutions") {
      const examId = Number(row?.exam_id);
      if (Number.isInteger(examId) && examId > 0) examIds.add(examId);
    }
  }

  const resolvedCodes = await Promise.all(
    [...examIds].map((examId) => resolveCourseCode(examId)),
  );

  for (const code of resolvedCodes) {
    if (code) codes.add(code.trim().toUpperCase());
  }

  if (!codes.size) {
    throw createError({
      statusCode: 422,
      message: "Could not resolve a course code from the webhook payload",
    });
  }

  const tags = [...codes].map(courseTag);

  if (body?.table !== "exam_stats" && body?.table !== "solutions") {
    tags.push(SITEMAP_TAG);
  }

  await purgeTags(tags);

  return { purged: tags };
});
