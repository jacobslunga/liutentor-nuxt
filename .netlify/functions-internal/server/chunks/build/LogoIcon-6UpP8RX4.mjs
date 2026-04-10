import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { u as useColorMode } from './composables-DcTAvR1A.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LogoIcon",
  __ssrInlineRender: true,
  props: {
    className: {},
    width: {},
    height: {},
    isBlackAndWhite: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const colorMode = useColorMode();
    const isDark = computed(() => colorMode.value === "dark");
    const src = computed(() => {
      if (props.isBlackAndWhite) {
        return isDark.value ? "/images/logo-white.svg" : "/images/logo-black.svg";
      }
      return isDark.value ? "/images/logo-dark.svg" : "/images/logo-light.svg";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<img${ssrRenderAttrs(mergeProps({
        src: src.value,
        alt: "Logo",
        class: __props.className,
        style: {
          width: __props.width ? __props.width + "px" : void 0,
          height: __props.height ? __props.height + "px" : void 0
        }
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LogoIcon.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "LogoIcon" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=LogoIcon-6UpP8RX4.mjs.map
