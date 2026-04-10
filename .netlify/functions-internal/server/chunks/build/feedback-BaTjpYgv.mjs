import { C as CircleAlert } from './circle-alert-CYwTyQYA.mjs';
import { L as LoaderCircle } from './loader-circle-CyCLhslC.mjs';
import { C as Check } from './check-BLXG-m6W.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BhLqGJzv.mjs';
import { f as useSeoMeta, a as _sfc_main$2 } from './server.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import './createLucideIcon-DZ6770Kf.mjs';
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
  __name: "feedback",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Feedback",
      description: "Skicka feedback till LiU Tentor-teamet.",
      robots: "index, follow"
    });
    const form = reactive({
      name: "",
      liu_mail: "",
      partOfWebsite: "",
      message: ""
    });
    const errors = reactive({
      liu_mail: "",
      message: ""
    });
    const isSuccess = ref(null);
    const isSubmitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideCheck = Check;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Button = _sfc_main$2;
      const _component_LucideAlertCircle = CircleAlert;
      const _component_LucideLoader2 = LoaderCircle;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-2xl" }, _attrs))}><h1 class="text-3xl font-semibold text-foreground mb-2">Feedback</h1><p class="text-sm font-normal text-muted-foreground mb-6"> Hjälp oss bli bättre – dela dina tankar och förslag. </p>`);
      if (unref(isSuccess) === true) {
        _push(`<div class="flex flex-col items-center gap-4 text-center py-8"><div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_LucideCheck, { class: "h-6 w-6 text-green-600 dark:text-green-400" }, null, _parent));
        _push(`</div><div><h2 class="text-xl font-normal mb-1">Tack!</h2><p class="text-sm text-muted-foreground"> Vi har tagit emot din feedback och återkommer om det behövs. </p></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Button, { size: "sm" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Tillbaka till startsidan`);
                  } else {
                    return [
                      createTextVNode("Tillbaka till startsidan")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Button, { size: "sm" }, {
                  default: withCtx(() => [
                    createTextVNode("Tillbaka till startsidan")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(isSuccess) === false) {
        _push(`<div class="flex flex-col items-center gap-4 text-center py-8"><div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_LucideAlertCircle, { class: "h-6 w-6 text-red-600 dark:text-red-400" }, null, _parent));
        _push(`</div><div><h2 class="text-xl font-normal mb-1">Något gick fel</h2><p class="text-sm text-muted-foreground"> Försök igen eller kontakta oss direkt på liutentor@gmail.com </p></div>`);
        _push(ssrRenderComponent(_component_Button, {
          size: "sm",
          onClick: ($event) => isSuccess.value = null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Försök igen`);
            } else {
              return [
                createTextVNode("Försök igen")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<form class="space-y-5"><div><div class="flex items-center justify-between mb-2"><span class="text-sm font-normal">Namn</span><span class="text-sm text-muted-foreground">Valfritt</span></div><input${ssrRenderAttr("value", unref(form).name)} placeholder="Ditt namn" class="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"></div><div><div class="flex items-center justify-between mb-2"><span class="text-sm font-normal">LiU Mail</span><span class="text-destructive text-sm">*</span></div><input${ssrRenderAttr("value", unref(form).liu_mail)} placeholder="liuid123@student.liu.se" class="${ssrRenderClass([unref(errors).liu_mail ? "border-destructive" : "", "w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"])}">`);
        if (unref(errors).liu_mail) {
          _push(`<p class="text-xs text-destructive mt-1">${ssrInterpolate(unref(errors).liu_mail)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-xs text-muted-foreground mt-1"> Format: liuid123@student.liu.se </p></div><div><div class="flex items-center justify-between mb-2"><span class="text-sm font-normal">Del av hemsidan</span><span class="text-sm text-muted-foreground">Valfritt</span></div><input${ssrRenderAttr("value", unref(form).partOfWebsite)} placeholder="t.ex. Söksidan, PDF-visaren..." class="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring"></div><div><div class="flex items-center justify-between mb-2"><span class="text-sm font-normal">Meddelande</span><span class="text-destructive text-sm">*</span></div><textarea placeholder="Berätta vad du tänker..." rows="5" class="${ssrRenderClass([unref(errors).message ? "border-destructive" : "", "w-full px-3 py-2 rounded-md border border-input bg-transparent text-sm outline-none focus:ring-1 focus:ring-ring resize-none"])}">${ssrInterpolate(unref(form).message)}</textarea>`);
        if (unref(errors).message) {
          _push(`<p class="text-xs text-destructive mt-1">${ssrInterpolate(unref(errors).message)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-xs text-muted-foreground mt-1">Minst 10 tecken</p></div><div class="flex items-center justify-between pt-2"><p class="text-xs text-muted-foreground"><span class="text-destructive">*</span> Obligatoriskt fält </p>`);
        _push(ssrRenderComponent(_component_Button, {
          type: "submit",
          size: "sm",
          disabled: unref(isSubmitting)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(isSubmitting)) {
                _push2(ssrRenderComponent(_component_LucideLoader2, { class: "w-3.5 h-3.5 animate-spin" }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(` Skicka `);
            } else {
              return [
                unref(isSubmitting) ? (openBlock(), createBlock(_component_LucideLoader2, {
                  key: 0,
                  class: "w-3.5 h-3.5 animate-spin"
                })) : createCommentVNode("", true),
                createTextVNode(" Skicka ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/feedback.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=feedback-BaTjpYgv.mjs.map
