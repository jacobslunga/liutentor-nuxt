import { courseTag, SITEMAP_TAG } from "../utils/cache";

type WebhookBody = {
  type?: string;
  table?: string;
  record?: Record<string, any> | null;
  old_record?: Record<string, any> | null;

  courseCodes?: string[];
};

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
  for (const code of body?.courseCodes ?? []) {
    if (code) codes.add(String(code).trim().toUpperCase());
  }

  for (const row of [body?.record, body?.old_record]) {
    const code = row?.course_code;
    if (code) codes.add(String(code).trim().toUpperCase());
  }

  if (!codes.size) {
    return { purged: [], note: "no course_code in payload" };
  }

  const tags = [...codes].map(courseTag);

  if (body?.table !== "exam_stats") tags.push(SITEMAP_TAG);

  await purgeTags(tags);

  return { purged: tags };
});
