import { _ as __nuxt_component_1$1 } from './LogoIcon-6UpP8RX4.mjs';
import { A as ArrowUp } from './arrow-up-ByjqP6Lo.mjs';
import { defineComponent, ref, mergeProps, withCtx, createVNode, createTextVNode, computed, watch, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { c as courseCodes } from './courseCodes-CFN6Z9T3.mjs';
import { f as useSeoMeta, a as _sfc_main$2$1 } from './server.mjs';
import { u as useRecentSearches } from './useRecentSearches-Bor5lFt3.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BhLqGJzv.mjs';
import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { U as Upload } from './upload-BFP_z3M6.mjs';
import './composables-DcTAvR1A.mjs';
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
import './cookie-CWJ58jSV.mjs';

const __iconNode = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
];
const ArrowUpRight = createLucideIcon("arrow-up-right", __iconNode);
const ITEM_HEIGHT = 36;
const OVERSCAN = 5;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MainInput",
  __ssrInlineRender: true,
  props: {
    focusInput: { type: Boolean }
  },
  emits: ["update:focusInput"],
  setup(__props, { emit: __emit }) {
    const upperCourseCodes = computed(
      () => courseCodes.map((c) => c.toUpperCase())
    );
    const isLoading = ref(false);
    const props = __props;
    const router = useRouter();
    const courseCode = ref("");
    const suggestions = ref([]);
    const showSuggestions = ref(false);
    const selectedIndex = ref(-1);
    const searchMethod = ref("tentor");
    const { add } = useRecentSearches();
    ref(null);
    ref(null);
    watch([courseCode, () => props.focusInput], () => {
      const q = courseCode.value.toUpperCase().trim();
      if (!q) {
        showSuggestions.value = false;
        return;
      }
      if (props.focusInput) showSuggestions.value = true;
      suggestions.value = upperCourseCodes.value.filter((code) => code.includes(q)).slice(0, 60);
      selectedIndex.value = -1;
    });
    const scrollTop = ref(0);
    const virtualItems = computed(() => {
      const containerHeight = 256;
      const start = Math.max(
        0,
        Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN
      );
      const end = Math.min(
        suggestions.value.length - 1,
        Math.ceil((scrollTop.value + containerHeight) / ITEM_HEIGHT) + OVERSCAN
      );
      return Array.from({ length: end - start + 1 }, (_, i) => ({
        index: start + i,
        item: suggestions.value[start + i],
        top: (start + i) * ITEM_HEIGHT
      })).filter(
        (row) => row.item !== void 0
      );
    });
    const totalHeight = computed(() => suggestions.value.length * ITEM_HEIGHT);
    function handleSelectCourse(course) {
      const searchCode = course.toUpperCase();
      if (!searchCode) return;
      add(courseCode.value);
      courseCode.value = "";
      showSuggestions.value = false;
      router.push(
        searchMethod.value === "stats" ? `/search/${searchCode}/stats` : `/search/${searchCode}`
      );
    }
    const typed = ref("");
    const exIndex = ref(Math.floor(Math.random() * courseCodes.length));
    const charIndex = ref(0);
    const deleting = ref(false);
    let typingTimer = null;
    const shuffledExamples = [...courseCodes].sort(() => Math.random() - 0.5);
    function runTyping() {
      if (courseCode.value) return;
      const current = shuffledExamples[exIndex.value % shuffledExamples.length] ?? "";
      const doneTyping = charIndex.value === current.length && !deleting.value;
      const doneDeleting = charIndex.value === 0 && deleting.value;
      const speed = deleting.value ? 30 : 55;
      const pause = doneTyping ? 1200 : doneDeleting ? 500 : 0;
      typingTimer = setTimeout(() => {
        if (doneTyping) {
          deleting.value = true;
        } else if (doneDeleting) {
          deleting.value = false;
          exIndex.value = (exIndex.value + 1) % shuffledExamples.length;
        } else {
          charIndex.value += deleting.value ? -1 : 1;
          typed.value = current.slice(0, charIndex.value);
        }
        runTyping();
      }, pause || speed);
    }
    watch(courseCode, (val) => {
      if (val && typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      } else if (!val && !typingTimer) {
        runTyping();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideArrowUp = ArrowUp;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative w-full" }, _attrs))}><div class="w-full relative flex flex-row items-center justify-center px-4"><select class="shrink-0 w-20 rounded-full text-foreground/60 hover:text-foreground bg-transparent border-none outline-none cursor-pointer"><option value="tentor"${ssrIncludeBooleanAttr(Array.isArray(searchMethod.value) ? ssrLooseContain(searchMethod.value, "tentor") : ssrLooseEqual(searchMethod.value, "tentor")) ? " selected" : ""}>Tentor</option><option value="stats"${ssrIncludeBooleanAttr(Array.isArray(searchMethod.value) ? ssrLooseContain(searchMethod.value, "stats") : ssrLooseEqual(searchMethod.value, "stats")) ? " selected" : ""}>Statistik</option></select><div class="shrink-0 h-6.25 w-px bg-foreground/10 ml-4"></div><input${ssrRenderAttr("value", courseCode.value.toUpperCase())} class="min-w-0 w-full p-4 border-none bg-transparent text-md text-foreground/80 outline-none"${ssrRenderAttr("placeholder", `Sök efter ${typed.value}`)}>`);
      _push(ssrRenderComponent(_sfc_main$2$1, {
        class: "absolute right-3",
        variant: "outline",
        size: "icon-sm",
        disabled: !courseCode.value,
        "aria-label": "Search",
        onClick: ($event) => handleSelectCourse(courseCode.value)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_LucideArrowUp, { class: "w-5 h-5" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_LucideArrowUp, { class: "w-5 h-5" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (showSuggestions.value && suggestions.value.length > 0) {
        _push(`<div class="absolute w-full left-0 mt-2 bg-background rounded-2xl border shadow-md z-40 max-h-72 overflow-hidden text-sm">`);
        if (isLoading.value) {
          _push(`<div class="p-3 text-sm text-muted-foreground"> Laddar... </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="px-3 pt-3 pb-1 text-muted-foreground font-normal"> Alla kurser </div><div class="overflow-y-auto max-h-64 scrollbar-hide"><div style="${ssrRenderStyle({
          height: `${totalHeight.value}px`,
          position: "relative",
          width: "100%"
        })}"><!--[-->`);
        ssrRenderList(virtualItems.value, ({ index, item, top }) => {
          _push(`<div class="${ssrRenderClass([
            "flex items-center px-4 py-2 cursor-pointer transition-colors",
            index === selectedIndex.value ? "bg-muted text-foreground" : "hover:bg-muted/50"
          ])}" style="${ssrRenderStyle({
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${ITEM_HEIGHT}px`,
            transform: `translateY(${top}px)`
          })}"><span class="flex-1 font-normal">${ssrInterpolate(item)}</span></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MainInput.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$2, { __name: "MainInput" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RecentSearches",
  __ssrInlineRender: true,
  setup(__props) {
    const { latest } = useRecentSearches();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LucideArrowUpRight = ArrowUpRight;
      if (unref(latest).length > 0) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2 text-sm text-muted-foreground" }, _attrs))}><!--[-->`);
        ssrRenderList(unref(latest), (s, i) => {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/search/${s.courseCode}`,
            class: "flex items-center gap-1 hover:text-foreground transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-normal text-xs"${_scopeId}>${ssrInterpolate(s.courseCode)}</span>`);
                _push2(ssrRenderComponent(_component_LucideArrowUpRight, { class: "w-3 h-3" }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode("span", { class: "font-normal text-xs" }, toDisplayString(s.courseCode), 1),
                  createVNode(_component_LucideArrowUpRight, { class: "w-3 h-3" })
                ];
              }
            }),
            _: 2
          }, _parent));
          if (i < unref(latest).length - 1) {
            _push(`<span class="text-border">|</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RecentSearches.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "RecentSearches" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Sök tentor",
      description: "Hitta gamla tentor från Linköpings Universitet"
    });
    const focusInput = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LogoIcon = __nuxt_component_1$1;
      const _component_MainInput = __nuxt_component_1;
      const _component_RecentSearches = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LucideUpload = Upload;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative flex flex-col items-center justify-start w-full min-h-screen p-4 pt-[20vh] bg-background" }, _attrs))}><div class="flex flex-col items-center space-y-2 mb-10"><div class="flex flex-row items-center justify-center space-x-2">`);
      _push(ssrRenderComponent(_component_LogoIcon, { class: "w-12 h-12 md:w-14 md:h-14 lg:w-24 lg:h-24" }, null, _parent));
      _push(`<h1 class="text-4xl lg:text-5xl font-normal font-logo tracking-tighter"> LiU Tentor </h1></div></div><div class="w-full max-w-150 flex flex-col items-center space-y-6 mb-20"><div class="relative w-full"><div class="${ssrRenderClass([
        focusInput.value ? "border-primary ring-1 ring-primary" : "hover:border-foreground/40",
        "w-full border border-foreground/20 bg-background flex flex-row items-center justify-center rounded-full transition-all duration-200 text-sm text-foreground/80 outline-none"
      ])}">`);
      _push(ssrRenderComponent(_component_MainInput, {
        focusInput: focusInput.value,
        "onUpdate:focusInput": ($event) => focusInput.value = $event
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_RecentSearches, null, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/upload-exams" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_sfc_main$2$1, {
              variant: "outline",
              size: "sm"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_LucideUpload, { class: "w-4.5 h-4.5" }, null, _parent3, _scopeId2));
                  _push3(` Ladda upp fler tentor `);
                } else {
                  return [
                    createVNode(_component_LucideUpload, { class: "w-4.5 h-4.5" }),
                    createTextVNode(" Ladda upp fler tentor ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_sfc_main$2$1, {
                variant: "outline",
                size: "sm"
              }, {
                default: withCtx(() => [
                  createVNode(_component_LucideUpload, { class: "w-4.5 h-4.5" }),
                  createTextVNode(" Ladda upp fler tentor ")
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dzbxqrhr.mjs.map
