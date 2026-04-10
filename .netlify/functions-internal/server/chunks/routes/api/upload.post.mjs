import { d as defineEventHandler, r as readBody, u as useSupabase, a as useRuntimeConfig, c as createError } from '../../nitro/nitro.mjs';
import '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';

const upload_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const supabase = useSupabase();
  const { courseCode, originalFilename, normalizedFilename } = body;
  const filePath = `public/${normalizedFilename}`;
  const { error: dbError } = await supabase.from("pending_uploads").insert([
    {
      course_code: courseCode,
      original_filename: originalFilename,
      pdf_url: `${useRuntimeConfig().public.supabaseUrl}/storage/v1/object/public/pending-pdfs/${filePath}`
    }
  ]);
  if (dbError) throw createError({ statusCode: 500, message: dbError.message });
  return { success: true };
});

export { upload_post as default };
//# sourceMappingURL=upload.post.mjs.map
