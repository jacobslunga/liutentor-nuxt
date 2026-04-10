import { _ as __nuxt_component_0$1 } from './nuxt-link-BhLqGJzv.mjs';
import { _ as __nuxt_component_1$1 } from './LogoIcon-6UpP8RX4.mjs';
import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { X } from './x-PSThSuOQ.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, ref, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { c as courseCodes } from './courseCodes-CFN6Z9T3.mjs';
import { b as useRoute, _ as _export_sfc, u as useRouter } from './server.mjs';
import { u as useRecentSearches } from './useRecentSearches-Bor5lFt3.mjs';
import { _ as __nuxt_component_1, a as __nuxt_component_3 } from './AppFooter-C7c9maE0.mjs';
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
import './composables-DcTAvR1A.mjs';
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
import './cookie-CWJ58jSV.mjs';
import './DialogTrigger-zc1GJJHL.mjs';
import '@vueuse/core';
import './SettingsDialogContent-CD5qzbDM.mjs';

const __iconNode$1 = [
  ["path", { d: "M20 4v7a4 4 0 0 1-4 4H4", key: "6o5b7l" }],
  ["path", { d: "m9 10-5 5 5 5", key: "1kshq7" }]
];
const CornerDownLeft = createLucideIcon("corner-down-left", __iconNode$1);
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CourseSearchDropdown",
  __ssrInlineRender: true,
  props: {
    size: {},
    class: {}
  },
  setup(__props) {
    const props = __props;
    useRouter();
    useRoute();
    useRecentSearches();
    const courseCode = ref("");
    const suggestions = ref([]);
    const showSuggestions = ref(false);
    const selectedIndex = ref(-1);
    ref(false);
    ref(null);
    ref(null);
    const upperCodes = courseCodes.map((c) => c.toUpperCase());
    watch(courseCode, (val) => {
      const q = val.toUpperCase().trim();
      if (!q) {
        suggestions.value = [];
        return;
      }
      suggestions.value = upperCodes.filter((c) => c.includes(q)).slice(0, 10);
      showSuggestions.value = true;
      selectedIndex.value = -1;
    });
    const sizeClass = computed(
      () => ({
        sm: "text-xs py-1.5 px-3",
        md: "text-sm py-2 px-3",
        lg: "text-base py-2.5 px-3"
      })[props.size ?? "md"]
    );
    const iconSize = computed(
      () => ({
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
      })[props.size ?? "md"]
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideSearch = Search;
      const _component_LucideX = X;
      const _component_LucideCornerDownLeft = CornerDownLeft;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["relative", props.class]
      }, _attrs))}><div class="relative flex items-center">`);
      _push(ssrRenderComponent(_component_LucideSearch, {
        class: ["absolute left-3 pointer-events-none text-muted-foreground z-10", unref(iconSize)]
      }, null, _parent));
      _push(`<input${ssrRenderAttr("value", unref(courseCode).toUpperCase())} placeholder="Sök kurskod..." class="${ssrRenderClass([unref(sizeClass), "w-full rounded-full bg-transparent border-none outline-none pl-9 pr-9 text-foreground placeholder:text-muted-foreground"])}">`);
      if (!unref(courseCode)) {
        _push(`<div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex"><kbd class="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground"> / </kbd></div>`);
      } else {
        _push(`<button class="absolute right-3 top-1/2 -translate-y-1/2 z-10" aria-label="Rensa">`);
        _push(ssrRenderComponent(_component_LucideX, {
          class: ["text-muted-foreground hover:text-foreground transition-colors", unref(iconSize)]
        }, null, _parent));
        _push(`</button>`);
      }
      _push(`</div>`);
      if (unref(showSuggestions) && unref(suggestions).length > 0) {
        _push(`<div class="absolute w-full left-0 mt-2 bg-background border border-border rounded-xl z-60 max-h-72 overflow-y-auto text-sm shadow-md"><div class="px-3 pt-3 pb-1 text-xs text-muted-foreground"> Alla kurser </div><!--[-->`);
        ssrRenderList(unref(suggestions), (suggestion, index) => {
          _push(`<div class="${ssrRenderClass([
            index === unref(selectedIndex) ? "bg-muted text-foreground" : "hover:bg-muted/50",
            "flex items-center px-3 py-2 cursor-pointer transition-colors"
          ])}"><span class="flex-1 font-normal">${ssrInterpolate(suggestion)}</span>`);
          _push(ssrRenderComponent(_component_LucideCornerDownLeft, { class: "w-3.5 h-3.5 opacity-40" }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CourseSearchDropdown.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$2, { __name: "CourseSearchDropdown" });
const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_LogoIcon = __nuxt_component_1$1;
  const _component_CourseSearchDropdown = __nuxt_component_2;
  const _component_SettingsDialog = __nuxt_component_3;
  _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-50 w-full" }, _attrs))}><div class="absolute inset-0 bg-background/80 backdrop-blur-xl -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"></div><div class="container h-14 max-w-full flex items-center px-4 md:px-10 lg:px-20 relative z-10">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "absolute left-4 md:left-10 lg:left-20 flex items-center hover:opacity-80 transition-opacity gap-2 shrink-0",
    "aria-label": "LiU Tentor"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_LogoIcon, { class: "w-10 h-10" }, null, _parent2, _scopeId));
        _push2(`<h1 class="text-xl hidden lg:flex font-normal font-logo tracking-tighter"${_scopeId}> LiU Tentor </h1>`);
      } else {
        return [
          createVNode(_component_LogoIcon, { class: "w-10 h-10" }),
          createVNode("h1", { class: "text-xl hidden lg:flex font-normal font-logo tracking-tighter" }, " LiU Tentor ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<div class="w-full flex justify-center"><div class="w-full max-w-md hidden md:flex"><div class="w-full border border-foreground/20 hover:border-foreground/40 bg-background flex items-center rounded-full transition-all duration-200">`);
  _push(ssrRenderComponent(_component_CourseSearchDropdown, {
    size: "md",
    class: "w-full"
  }, null, _parent));
  _push(`</div></div></div><div class="absolute right-4 md:right-10 lg:right-20 flex items-center">`);
  _push(ssrRenderComponent(_component_SettingsDialog, null, null, _parent));
  _push(`</div></div></header>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "SearchHeader" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "search",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const isExamViewUrl = computed(() => {
      return /^\/search\/[A-Z0-9]+\/\d+$/.test(route.path);
    });
    const hideFooter = computed(
      () => /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(route.path) || /^\/quiz\/[^/]+$/.test(route.path)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_search_header = __nuxt_component_0;
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col min-h-screen w-full" }, _attrs))}>`);
      if (!unref(isExamViewUrl)) {
        _push(ssrRenderComponent(_component_search_header, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="flex grow flex-col max-w-full w-full relative">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (!unref(hideFooter)) {
        _push(ssrRenderComponent(_component_AppFooter, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=search-DMZI3cXv.mjs.map
