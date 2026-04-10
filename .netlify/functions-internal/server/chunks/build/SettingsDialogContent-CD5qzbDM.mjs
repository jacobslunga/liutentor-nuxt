import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useColorMode } from './composables-DcTAvR1A.mjs';

const __iconNode$4 = [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
];
const Monitor = createLucideIcon("monitor", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M18 5h4", key: "1lhgn2" }],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
const MoonStar = createLucideIcon("moon-star", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 4v16", key: "1654pz" }],
  ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2", key: "e0r10z" }],
  ["path", { d: "M9 20h6", key: "s66wpe" }]
];
const Type = createLucideIcon("type", __iconNode);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SettingsDialogContent",
  __ssrInlineRender: true,
  setup(__props) {
    const colorMode = useColorMode();
    const theme = computed({
      get: () => colorMode.preference,
      set: (val) => {
        colorMode.preference = val;
      }
    });
    const themeOptions = [
      { id: "light", label: "Light" },
      { id: "dark", label: "Dark" },
      { id: "system", label: "System" }
    ];
    const textSize = ref("standard");
    const textSizeOptions = [
      { id: "liten", label: "Liten" },
      { id: "standard", label: "Standard" },
      { id: "stor", label: "Stor" }
    ];
    watch(textSize, (val) => {
      const map = { liten: "14px", standard: "16px", stor: "18px" };
      (void 0).documentElement.style.fontSize = map[val];
    });
    const shortcuts = [
      { action: "Visa/dölj facit", key: "E", category: "visibility" },
      { action: "Visa/dölj AI-chat", key: "C", category: "visibility" }
    ];
    const categories = [{ id: "visibility", label: "Synlighet" }];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideSun = Sun;
      const _component_LucideMoonStar = MoonStar;
      const _component_LucideMonitor = Monitor;
      const _component_LucideType = Type;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-6 pt-2" }, _attrs))}><div class="space-y-3"><h3 class="font-normal">Tema</h3><div class="flex gap-2"><!--[-->`);
      ssrRenderList(themeOptions, (opt) => {
        _push(`<div class="${ssrRenderClass([
          unref(theme) === opt.id ? "bg-primary/5 border-primary" : "bg-card border-border",
          "flex-1 cursor-pointer rounded-md border transition-all select-none flex flex-col items-center justify-center gap-2 py-4 hover:bg-primary/5 hover:border-primary"
        ])}">`);
        if (opt.id === "light") {
          _push(ssrRenderComponent(_component_LucideSun, { class: "w-4.5 h-4.5" }, null, _parent));
        } else if (opt.id === "dark") {
          _push(ssrRenderComponent(_component_LucideMoonStar, { class: "w-4.5 h-4.5" }, null, _parent));
        } else {
          _push(ssrRenderComponent(_component_LucideMonitor, { class: "w-4.5 h-4.5" }, null, _parent));
        }
        _push(`<span class="text-sm font-normal">${ssrInterpolate(opt.label)}</span></div>`);
      });
      _push(`<!--]--></div></div><div class="space-y-3"><h3 class="font-normal">Textstorlek</h3><div class="flex gap-2"><!--[-->`);
      ssrRenderList(textSizeOptions, (opt) => {
        _push(`<div class="${ssrRenderClass([
          unref(textSize) === opt.id ? "bg-primary/10 border-primary" : "bg-card border-border",
          "flex-1 cursor-pointer rounded-md border transition-all select-none flex flex-col items-center justify-center gap-2 py-4 hover:bg-primary/5 hover:border-primary"
        ])}">`);
        _push(ssrRenderComponent(_component_LucideType, {
          class: {
            "text-sm": opt.id === "liten",
            "text-base": opt.id === "standard",
            "text-xl": opt.id === "stor"
          }
        }, null, _parent));
        _push(`<span class="text-sm font-normal">${ssrInterpolate(opt.label)}</span></div>`);
      });
      _push(`<!--]--></div></div><div class="space-y-3"><h3 class="font-normal">Tangentbordsgenvägar</h3><div class="space-y-4"><!--[-->`);
      ssrRenderList(categories, (cat) => {
        _push(`<div class="space-y-2"><h4 class="text-sm text-muted-foreground">${ssrInterpolate(cat.label)}</h4><div class="rounded-lg border bg-card"><table class="w-full"><tbody class="divide-y divide-border"><!--[-->`);
        ssrRenderList(shortcuts.filter((s) => s.category === cat.id), (s) => {
          _push(`<tr class="text-sm"><td class="px-4 py-3 text-foreground">${ssrInterpolate(s.action)}</td><td class="px-4 py-3 text-right"><kbd class="inline-flex h-7 items-center rounded border bg-muted px-2 font-mono text-sm text-muted-foreground">${ssrInterpolate(s.key)}</kbd></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SettingsDialogContent.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_8 = Object.assign(_sfc_main, { __name: "SettingsDialogContent" });

export { Settings as S, __nuxt_component_8 as _ };
//# sourceMappingURL=SettingsDialogContent-CD5qzbDM.mjs.map
