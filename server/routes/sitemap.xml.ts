import { serverSupabaseClient } from "#supabase/server";
import { SITEMAP_TAG, setCdnCache } from "../utils/cache";

/** PostgREST caps a single response at 1000 rows, so page through explicitly. */
const PAGE_SIZE = 1000;

type ExamRow = { course_code: string | null; exam_date: string | null };

async function fetchCourseLastmods(event: any) {
  const supabase = await serverSupabaseClient(event);
  /** course code -> most recent exam date */
  const lastmods = new Map<string, string>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("exams")
      .select("course_code, exam_date")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data as ExamRow[]) {
      if (!row?.course_code) continue;
      const code = String(row.course_code).trim().toUpperCase();
      if (!code) continue;

      const date = row.exam_date ? String(row.exam_date).slice(0, 10) : null;
      const current = lastmods.get(code);
      if (!current || (date && date > current)) {
        lastmods.set(code, date ?? current ?? "");
      }
    }

    if (data.length < PAGE_SIZE) break;
  }

  return lastmods;
}

export default defineEventHandler(async (event) => {
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    "https://liutentor.se/",
    "https://liutentor.se/om-oss",
    "https://liutentor.se/faq",
    "https://liutentor.se/upload-exams",
  ];

  // Only advertise course pages that actually have exams. Course codes without
  // exams render a thin "vi saknar tentor" page and are noindexed, so listing
  // them here would burn crawl budget for nothing.
  let lastmods = new Map<string, string>();
  try {
    lastmods = await fetchCourseLastmods(event);
  } catch {
    // Prefer a sitemap with only the static pages over one full of URLs we
    // cannot verify have content.
    lastmods = new Map();
  }

  const entries = [
    ...staticUrls.map(
      (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
    ),
    ...Array.from(lastmods.keys())
      .sort()
      .map(
        (code) => `  <url>
    <loc>https://liutentor.se/search/${code}</loc>
    <lastmod>${lastmods.get(code) || today}</lastmod>
  </url>`,
      ),
  ].join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml");
  // Purged alongside course pages when exams are published, since publishing
  // can add a course code that was not previously listed.
  setCdnCache(event, [SITEMAP_TAG]);

  return sitemapXml;
});
