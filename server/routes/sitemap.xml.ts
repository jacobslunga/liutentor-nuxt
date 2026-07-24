import courseCodes from "~/data/courseCodes.json";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const codes = new Set<string>();

  // Add course codes from static JSON fallback list
  if (Array.isArray(courseCodes)) {
    courseCodes.forEach((code: string) => {
      if (code) codes.add(code.trim().toUpperCase());
    });
  }

  try {
    const supabase = await serverSupabaseClient(event);
    const { data } = await supabase
      .from("exams")
      .select("course_code");

    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row?.course_code) codes.add(String(row.course_code).trim().toUpperCase());
      });
    }
  } catch {
    // If Supabase client fails, fallback list is already populated
  }

  const staticUrls = [
    "https://liutentor.se/",
    "https://liutentor.se/om-oss",
    "https://liutentor.se/faq",
    "https://liutentor.se/upload-exams",
  ];

  const now = new Date().toISOString().split("T")[0];

  const xmlEntries = [
    ...staticUrls.map(
      (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
    ),
    ...Array.from(codes).sort().map(
      (code) => `  <url>
    <loc>https://liutentor.se/search/${code}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    ),
  ].join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml");
  setHeader(event, "Cache-Control", "public, max-age=86400, s-maxage=86400");

  return sitemapXml;
});
