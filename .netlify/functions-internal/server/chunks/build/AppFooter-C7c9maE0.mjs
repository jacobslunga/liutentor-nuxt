import { _ as __nuxt_component_1$1 } from './LogoIcon-6UpP8RX4.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BhLqGJzv.mjs';
import { _ as _sfc_main$9, a as _sfc_main$2, b as _sfc_main$6, c as _sfc_main$3, d as _sfc_main$1$1, e as _sfc_main$5 } from './DialogTrigger-zc1GJJHL.mjs';
import { _ as _export_sfc, a as _sfc_main$2$1 } from './server.mjs';
import { S as Settings, _ as __nuxt_component_8 } from './SettingsDialogContent-CD5qzbDM.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, unref, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Dialog = _sfc_main$9;
  const _component_DialogTrigger = _sfc_main$2;
  const _component_Button = _sfc_main$2$1;
  const _component_LucideSettings = Settings;
  const _component_DialogContent = _sfc_main$6;
  const _component_DialogHeader = _sfc_main$3;
  const _component_DialogTitle = _sfc_main$1$1;
  const _component_DialogDescription = _sfc_main$5;
  const _component_SettingsDialogContent = __nuxt_component_8;
  _push(ssrRenderComponent(_component_Dialog, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_DialogTrigger, { "as-child": "" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_Button, {
                variant: "ghost",
                size: "icon"
              }, {
                default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(ssrRenderComponent(_component_LucideSettings, { class: "w-4.5 h-4.5" }, null, _parent4, _scopeId3));
                  } else {
                    return [
                      createVNode(_component_LucideSettings, { class: "w-4.5 h-4.5" })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_Button, {
                  variant: "ghost",
                  size: "icon"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LucideSettings, { class: "w-4.5 h-4.5" })
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
        _push2(ssrRenderComponent(_component_DialogContent, { class: "w-[95vw] max-w-125 max-h-[90vh] overflow-y-auto rounded-xl" }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_DialogHeader, null, {
                default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                  if (_push4) {
                    _push4(ssrRenderComponent(_component_DialogTitle, { class: "text-2xl" }, {
                      default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`Inställningar`);
                        } else {
                          return [
                            createTextVNode("Inställningar")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                    _push4(ssrRenderComponent(_component_DialogDescription, null, {
                      default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                        if (_push5) {
                          _push5(`Anpassa din upplevelse`);
                        } else {
                          return [
                            createTextVNode("Anpassa din upplevelse")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent4, _scopeId3));
                  } else {
                    return [
                      createVNode(_component_DialogTitle, { class: "text-2xl" }, {
                        default: withCtx(() => [
                          createTextVNode("Inställningar")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_DialogDescription, null, {
                        default: withCtx(() => [
                          createTextVNode("Anpassa din upplevelse")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent3, _scopeId2));
              _push3(ssrRenderComponent(_component_SettingsDialogContent, null, null, _parent3, _scopeId2));
            } else {
              return [
                createVNode(_component_DialogHeader, null, {
                  default: withCtx(() => [
                    createVNode(_component_DialogTitle, { class: "text-2xl" }, {
                      default: withCtx(() => [
                        createTextVNode("Inställningar")
                      ]),
                      _: 1
                    }),
                    createVNode(_component_DialogDescription, null, {
                      default: withCtx(() => [
                        createTextVNode("Anpassa din upplevelse")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_SettingsDialogContent)
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_DialogTrigger, { "as-child": "" }, {
            default: withCtx(() => [
              createVNode(_component_Button, {
                variant: "ghost",
                size: "icon"
              }, {
                default: withCtx(() => [
                  createVNode(_component_LucideSettings, { class: "w-4.5 h-4.5" })
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          createVNode(_component_DialogContent, { class: "w-[95vw] max-w-125 max-h-[90vh] overflow-y-auto rounded-xl" }, {
            default: withCtx(() => [
              createVNode(_component_DialogHeader, null, {
                default: withCtx(() => [
                  createVNode(_component_DialogTitle, { class: "text-2xl" }, {
                    default: withCtx(() => [
                      createTextVNode("Inställningar")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_DialogDescription, null, {
                    default: withCtx(() => [
                      createTextVNode("Anpassa din upplevelse")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_SettingsDialogContent)
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SettingsDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "SettingsDialog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const groupedLinks = [
      {
        title: "Sidor",
        links: [
          { name: "Hem", href: "/" },
          { name: "Om oss", href: "/om-oss" }
        ]
      },
      {
        title: "Juridiskt",
        links: [{ name: "Integritetspolicy", href: "/privacy-policy" }]
      },
      {
        title: "Support",
        links: [
          { name: "Feedback", href: "/feedback" },
          { name: "Vanliga frågor", href: "/faq" }
        ]
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LogoIcon = __nuxt_component_1$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_SettingsDialog = __nuxt_component_3;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "w-full bg-background mt-24 relative z-10" }, _attrs))}><div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12"><div class="grid grid-cols-1 md:grid-cols-4 gap-8"><div class="md:col-span-1 space-y-4"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_LogoIcon, { class: "w-8 h-8 text-primary" }, null, _parent));
      _push(`<span class="text-xl font-logo font-normal tracking-tighter"> LiU Tentor </span></div><p class="text-sm font-normal text-muted-foreground"> Din resurs för tentamensarkiv vid Linköpings Universitet. </p></div><div class="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8"><!--[-->`);
      ssrRenderList(groupedLinks, (section) => {
        _push(`<div><h4 class="text-sm font-medium text-foreground/80 mb-3">${ssrInterpolate(section.title)}</h4><ul class="space-y-2"><!--[-->`);
        ssrRenderList(section.links, (link) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: link.href,
            class: "text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(link.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(link.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      });
      _push(`<!--]--></div></div><div class="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"><p class="text-xs font-normal text-muted-foreground"> © ${ssrInterpolate(unref(year))} LiU Tentor. Alla rättigheter förbehållna. </p><div class="flex items-center gap-4"><a href="mailto:liutentor@gmail.com" class="text-xs font-normal text-muted-foreground hover:text-primary transition-colors"> liutentor@gmail.com </a>`);
      _push(ssrRenderComponent(_component_SettingsDialog, null, null, _parent));
      _push(`</div></div></div></footer>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppFooter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "AppFooter" });

export { __nuxt_component_1 as _, __nuxt_component_3 as a };
//# sourceMappingURL=AppFooter-C7c9maE0.mjs.map
