import { d as defineEventHandler, g as getRouterParam } from '../../../nitro/nitro.mjs';
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

const _courseCode__get = defineEventHandler(async (e) => {
  const courseCode = getRouterParam(e, "courseCode");
  try {
    const data = await $fetch(
      `https://liutentor-go-api-production.up.railway.app/v1/exams/LIU/${courseCode}`
    );
    return data;
  } catch (err) {
    if ((err == null ? void 0 : err.status) === 404) {
      return { data: null };
    }
    throw err;
  }
});

export { _courseCode__get as default };
//# sourceMappingURL=_courseCode_.get.mjs.map
