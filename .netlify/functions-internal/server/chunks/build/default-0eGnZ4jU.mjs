import { _ as __nuxt_component_1 } from './AppFooter-C7c9maE0.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderComponent } from 'vue/server-renderer';
import { b as useRoute } from './server.mjs';
import './LogoIcon-6UpP8RX4.mjs';
import './composables-DcTAvR1A.mjs';
import './nuxt-link-BhLqGJzv.mjs';
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
import './DialogTrigger-zc1GJJHL.mjs';
import 'reka-ui';
import './x-PSThSuOQ.mjs';
import './createLucideIcon-DZ6770Kf.mjs';
import '@vueuse/core';
import './SettingsDialogContent-CD5qzbDM.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const hideFooter = computed(
      () => /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(route.path) || /^\/quiz\/[^/]+$/.test(route.path)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppFooter = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col max-w-full min-h-screen bg-background" }, _attrs))}><main class="grow">`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-0eGnZ4jU.mjs.map
