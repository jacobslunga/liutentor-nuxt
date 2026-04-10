import { d as defineEventHandler, g as getRouterParam } from '../../../../nitro/nitro.mjs';
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

const _examId__get = defineEventHandler(async (event) => {
  const examId = getRouterParam(event, "examId");
  const data = await $fetch(
    `https://liutentor-go-api-production.up.railway.app/v1/exams/${examId}`
  );
  return data;
});

export { _examId__get as default };
//# sourceMappingURL=_examId_.get.mjs.map
