import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { f as useSeoMeta } from './server.mjs';
import '../nitro/nitro.mjs';
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
import 'pinia';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import '@iconify/vue';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "om-oss",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Om oss",
      description: "Lär känna teamet bakom LiU Tentor och vår mission att göra tentorstudering enklare för alla studenter vid Linköpings universitet.",
      robots: "index, follow"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-3xl" }, _attrs))}><h1 class="text-3xl font-semibold text-foreground mb-2">Om oss</h1><p class="text-sm font-normal text-muted-foreground mb-6"> Studentdrivet projekt för enklare tentplugg </p><div class="text-sm text-foreground/80 font-normal leading-relaxed space-y-4"><p> LiU Tentor är ett ideellt initiativ som startades av några studenter vid Linköpings universitet som tröttnade på att klicka runt i evigheter för att hitta rätt tenta. Det började som ett sidoprojekt en sen kväll under tentaveckan, och har sedan dess vuxit till något större än vi trodde. </p><p> Vårt mål är enkelt: att göra det så smidigt som möjligt att hitta gamla tentor, lösningar och material för att kunna plugga smartare. Vi vet hur det känns att sitta dagen innan tenta och desperat leta efter en lösningsfil som kanske eller kanske inte finns någonstans på kurshemsidan. </p><p> Vi bygger LiU Tentor för att vi själva använder det – och förbättrar det ständigt utifrån våra behov, era förslag och små idéer som dyker upp mitt i natten. Det är ett passion project, men också något vi verkligen tror gör studentlivet lite enklare. </p><p> Har du idéer, hittat en bugg eller vill bara säga hej? Hör av dig! Vi älskar feedback. </p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/om-oss.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=om-oss-D1My7jYq.mjs.map
