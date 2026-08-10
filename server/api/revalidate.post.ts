import { courseTag, SITEMAP_TAG } from "../utils/cache";

/**
 * Purge target for Supabase database webhooks on `exams` and `exam_stats`.
 *
 * Nothing in the app writes to either table — exams and their statistics are
 * published out of band — so a database webhook is the one trigger that fires
 * no matter how the row gets inserted (dashboard, SQL, script, or the Go
 * service). Both tables carry `course_code`, so one handler covers both.
 *
 * Configure one webhook per table in Supabase → Database → Webhooks:
 *   table:   public.exams / public.exam_stats
 *   events:  INSERT, UPDATE, DELETE
 *   type:    HTTP Request → POST https://liutentor.se/api/revalidate
 *   header:  x-revalidate-secret: <NUXT_REVALIDATE_SECRET>
 */

type WebhookBody = {
  type?: string;
  table?: string;
  record?: Record<string, any> | null;
  old_record?: Record<string, any> | null;
  /** Allows manual purges: { "courseCodes": ["TATA91"] } */
  courseCodes?: string[];
};

async function purgeTags(tags: string[]) {
  // Netlify injects both of these into the function runtime, so no token
  // needs to be created or stored manually.
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
  // On UPDATE the course code could have moved, so purge both sides.
  for (const row of [body?.record, body?.old_record]) {
    const code = row?.course_code;
    if (code) codes.add(String(code).trim().toUpperCase());
  }

  if (!codes.size) {
    return { purged: [], note: "no course_code in payload" };
  }

  const tags = [...codes].map(courseTag);

  // The sitemap lists which courses have exams, so `exams` writes change it.
  // `exam_stats` only adds numbers to a course that is already listed, so its
  // webhook would purge the sitemap into an identical copy.
  if (body?.table !== "exam_stats") tags.push(SITEMAP_TAG);

  await purgeTags(tags);

  return { purged: tags };
});
