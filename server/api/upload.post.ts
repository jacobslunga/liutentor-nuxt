export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const supabase = useSupabase();

  const { courseCode, originalFilename, normalizedFilename } = body;

  const filePath = `public/${normalizedFilename}`;

  const { error: dbError } = await supabase.from("pending_uploads").insert([
    {
      course_code: courseCode,
      original_filename: originalFilename,
      pdf_url: `${useRuntimeConfig().public.supabaseUrl}/storage/v1/object/public/pending-pdfs/${filePath}`,
    },
  ]);

  if (dbError) throw createError({ statusCode: 500, message: dbError.message });

  return { success: true };
});
