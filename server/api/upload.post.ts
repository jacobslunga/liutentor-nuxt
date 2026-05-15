export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData)
    throw createError({ statusCode: 400, message: "No form data" });

  const get = (name: string) =>
    formData.find((f) => f.name === name)?.data.toString() ?? "";

  const fileField = formData.find((f) => f.name === "file");
  const courseCode = get("courseCode");
  const originalFilename = get("originalFilename");
  const normalizedFilename = get("normalizedFilename");

  if (!fileField?.data || !courseCode || !normalizedFilename) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  const supabase = useSupabase();
  const filePath = `public/${normalizedFilename}`;

  const { error: storageError } = await supabase.storage
    .from("pending-pdfs")
    .upload(filePath, fileField.data, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (storageError)
    throw createError({ statusCode: 500, message: storageError.message });

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
