import { defineComponent, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { reactiveOmit } from '@vueuse/core';
import { Separator } from 'reka-ui';
import { f as useSeoMeta, a as _sfc_main$2, c as cn } from './server.mjs';
import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
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
import 'clsx';
import 'tailwind-merge';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const __iconNode = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z",
      key: "1lbycx"
    }
  ],
  ["polyline", { points: "15,9 18,9 18,11", key: "1pm9c0" }],
  ["path", { d: "M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2", key: "15i455" }],
  ["line", { x1: "6", x2: "7", y1: "10", y2: "10", key: "1e2scm" }]
];
const Mailbox = createLucideIcon("mailbox", __iconNode);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Separator",
  __ssrInlineRender: true,
  props: {
    orientation: { default: "horizontal" },
    decorative: { type: Boolean, default: true },
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  setup(__props) {
    const props = __props;
    const delegatedProps = reactiveOmit(props, "class");
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Separator), mergeProps({ "data-slot": "separator" }, unref(delegatedProps), {
        class: unref(cn)(
          "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
          props.class
        )
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/separator/Separator.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "privacy-policy",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Integritetspolicy",
      description: "Läs om hur LiU Tentor hanterar dina personuppgifter och vår integritetspolicy.",
      robots: "index, follow"
    });
    function openMail() {
      (void 0).location.href = "mailto:liutentor@gmail.com";
    }
    const sections = [
      {
        title: "Information vi samlar in",
        content: "Vi samlar in begränsad information för att förbättra din upplevelse:",
        items: [
          "Anonyma användningsdata för att förbättra tjänsten",
          "Sökhistorik som sparas lokalt i din webbläsare",
          "Uppladdad tentamaterial som du väljer att dela",
          "Feedback du frivilligt lämnar"
        ]
      },
      {
        title: "Hur vi använder informationen",
        content: "Vi använder informationen enbart för att förbättra tjänsten och ge dig en bättre upplevelse. Vi säljer aldrig din data till tredje part."
      },
      {
        title: "Cookies",
        content: "Vi använder cookies för att spara inställningar och sökhistorik lokalt. Du kan rensa dessa när som helst via din webbläsares inställningar."
      },
      {
        title: "Tredjepartstjänster",
        content: "Vi använder Supabase för lagring och autentisering, samt anonyma analysverktyg. Dessa tjänster har egna integritetspolicyer."
      },
      {
        title: "Dina rättigheter",
        content: "Du har rätt att:",
        items: [
          "Begära tillgång till dina personuppgifter",
          "Begära rättelse eller radering av dina uppgifter",
          "Återkalla ditt samtycke när som helst"
        ]
      },
      {
        title: "Datasäkerhet",
        content: "Vi vidtar rimliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter mot obehörig åtkomst."
      },
      {
        title: "Kontakt",
        content: "Om du har frågor om vår integritetspolicy är du välkommen att kontakta oss:",
        items: [
          "E-post: liutentor@gmail.com",
          "Vi svarar normalt inom 48 timmar",
          "Du kan även använda feedbackformuläret på hemsidan"
        ]
      },
      {
        title: "Hantering av personuppgifter och GDPR",
        content: "Vi visar offentligt tillgängliga tentor som publicerats av universitetet, inklusive namn på examinatorer som en del av dokumentets originalinnehåll. Vi respekterar rätten till integritet och följer GDPR-regleringen.",
        items: [
          "Vi publicerar endast tentor som är offentligt tillgängliga.",
          "Examinatorers namn ingår endast om de finns med i den ursprungliga tentan.",
          "Om du vill begära borttagning av en tenta eller ett namn, vänligen kontakta oss via e-post."
        ]
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Separator = _sfc_main$1;
      const _component_LucideMailbox = Mailbox;
      const _component_Button = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-3xl" }, _attrs))}><h1 class="text-3xl font-semibold text-foreground mb-1"> Integritetspolicy </h1><p class="text-xs text-muted-foreground mb-6"> Senast uppdaterad: 2026/03/23 </p><p class="text-sm text-foreground/80 leading-relaxed mb-6"> Hos LiU Tentor värnar vi om din integritet. Denna policy beskriver hur vi samlar in, använder och skyddar information när du använder vår tjänst. </p>`);
      _push(ssrRenderComponent(_component_Separator, null, null, _parent));
      _push(`<div class="space-y-6 mt-8"><!--[-->`);
      ssrRenderList(sections, (section) => {
        _push(`<div class="mb-6"><h2 class="text-lg font-medium text-foreground mb-2">${ssrInterpolate(section.title)}</h2><p class="text-sm text-foreground/80 leading-relaxed">${ssrInterpolate(section.content)}</p>`);
        if (section.items) {
          _push(`<ul class="mt-3 list-disc pl-5 space-y-1 text-sm text-foreground/70"><!--[-->`);
          ssrRenderList(section.items, (item) => {
            _push(`<li>${ssrInterpolate(item)}</li>`);
          });
          _push(`<!--]--></ul>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="mt-8 pt-6 border-t space-y-2"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_LucideMailbox, { class: "h-5 w-5 text-primary" }, null, _parent));
      _push(`<h3 class="text-sm font-medium">Kontakta oss</h3></div><p class="text-sm text-muted-foreground"> Om du har frågor om vår integritetspolicy är du välkommen att kontakta oss. </p>`);
      _push(ssrRenderComponent(_component_Button, {
        size: "sm",
        onClick: openMail
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` liutentor@gmail.com `);
          } else {
            return [
              createTextVNode(" liutentor@gmail.com ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/privacy-policy.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=privacy-policy-DSelDz-G.mjs.map
