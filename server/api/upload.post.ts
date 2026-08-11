export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData)
    throw createError({ statusCode: 400, message: "No form data" });

  const metadataField = formData.find((field) => field.name === "metadata");
  const fileFields = formData.filter((field) => field.name === "files");

  let metadata: Array<{
    courseCode: string;
    originalFilename: string;
    normalizedFilename: string;
    examDate: string;
    fileType: "EXAM" | "SOLUTION";
  }>;

  try {
    metadata = JSON.parse(metadataField?.data.toString() ?? "[]");
  } catch {
    throw createError({ statusCode: 400, message: "Invalid upload metadata" });
  }

  if (!fileFields.length || fileFields.length !== metadata.length) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }

  const supabase = useSupabase();
  const uploaded = [];

  for (const [index, fileField] of fileFields.entries()) {
    const item = metadata[index];
    if (
      !item ||
      !fileField.data ||
      !item.courseCode ||
      !item.originalFilename ||
      !item.normalizedFilename ||
      !/^\d{4}-\d{2}-\d{2}$/.test(item.examDate) ||
      !["EXAM", "SOLUTION"].includes(item.fileType)
    ) {
      throw createError({ statusCode: 400, message: "Invalid file metadata" });
    }

    const filePath = `public/${item.normalizedFilename}`;
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
        course_code: item.courseCode,
        original_filename: item.originalFilename,
        pdf_url: `${useRuntimeConfig().public.supabaseUrl}/storage/v1/object/public/pending-pdfs/${filePath}`,
      },
    ]);

    if (dbError)
      throw createError({ statusCode: 500, message: dbError.message });
    uploaded.push(item);
  }

  let notificationSent = false;
  try {
    notificationSent = await sendUploadNotification(uploaded);
  } catch (error) {
    console.error("Failed to send upload notification", error);
  }

  return { success: true, uploaded: uploaded.length, notificationSent };
});
