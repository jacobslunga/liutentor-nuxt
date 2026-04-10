import { d as defineEventHandler, r as readBody, u as useSupabase, c as createError } from '../../nitro/nitro.mjs';
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

const feedback_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const supabase = useSupabase();
  const { error } = await supabase.from("feedback").insert([
    {
      name: body.name,
      message: body.message,
      part_of_website: body.part_of_website,
      liu_mail: body.liu_mail
    }
  ]);
  if (error) throw createError({ statusCode: 500, message: error.message });
  return { success: true };
});

export { feedback_post as default };
//# sourceMappingURL=feedback.post.mjs.map
