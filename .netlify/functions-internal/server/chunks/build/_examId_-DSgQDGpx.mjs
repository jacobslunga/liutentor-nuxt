import { _ as _export_sfc, b as useRoute, e as useFetch, f as useSeoMeta, a as _sfc_main$2$1, r as refreshNuxtData, d as __nuxt_component_4, u as useRouter, c as cn } from './server.mjs';
import { L as LoaderCircle } from './loader-circle-CyCLhslC.mjs';
import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { C as ChevronDown } from './chevron-down-D4KY3IxT.mjs';
import { S as Settings, _ as __nuxt_component_8$1 } from './SettingsDialogContent-CD5qzbDM.mjs';
import { defineComponent, computed, watchEffect, watch, ref, unref, withCtx, createTextVNode, createVNode, readonly, nextTick, mergeProps, isRef, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrRenderStyle, ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderSlot } from 'vue/server-renderer';
import { useForwardPropsEmits, DropdownMenuRoot, useForwardProps, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipArrow, DropdownMenuCheckboxItem, DropdownMenuItemIndicator, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from 'reka-ui';
import { C as Check } from './check-BLXG-m6W.mjs';
import { reactiveOmit } from '@vueuse/core';
import { _ as _sfc_main$9$1, a as _sfc_main$s, b as _sfc_main$6$1, c as _sfc_main$3$1, d as _sfc_main$1$1, e as _sfc_main$5$1 } from './DialogTrigger-zc1GJJHL.mjs';
import { defineStore, storeToRefs } from 'pinia';
import { U as Upload } from './upload-BFP_z3M6.mjs';
import { u as useColorMode } from './composables-DcTAvR1A.mjs';
import { C as CircleCheck, L as Lightbulb } from './lightbulb-BamvPcHz.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-BhLqGJzv.mjs';
import { A as ArrowUp } from './arrow-up-ByjqP6Lo.mjs';
import MarkdownIt from 'markdown-it';
import markdownItKatex from '@vscode/markdown-it-katex';
import DOMPurify from 'dompurify';
import { X } from './x-PSThSuOQ.mjs';
import { u as useCookie } from './cookie-CWJ58jSV.mjs';
import { onBeforeRouteUpdate } from 'vue-router';
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

const __iconNode$e = [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
];
const ArrowDown = createLucideIcon("arrow-down", __iconNode$e);
const __iconNode$d = [
  ["path", { d: "M3 19V5", key: "rwsyhb" }],
  ["path", { d: "m13 6-6 6 6 6", key: "1yhaz7" }],
  ["path", { d: "M7 12h14", key: "uoisry" }]
];
const ArrowLeftToLine = createLucideIcon("arrow-left-to-line", __iconNode$d);
const __iconNode$c = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$c);
const __iconNode$b = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode$b);
const __iconNode$a = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$a);
const __iconNode$9 = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]];
const Circle = createLucideIcon("circle", __iconNode$9);
const __iconNode$8 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M12 3v18", key: "108xh3" }]
];
const Columns2 = createLucideIcon("columns-2", __iconNode$8);
const __iconNode$7 = [
  ["path", { d: "M12 15V3", key: "m9g1x1" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["path", { d: "m7 10 5 5 5-5", key: "brsn70" }]
];
const Download = createLucideIcon("download", __iconNode$7);
const __iconNode$6 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
const GripVertical = createLucideIcon("grip-vertical", __iconNode$6);
const __iconNode$5 = [
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      key: "1sd12s"
    }
  ]
];
const MessageCircle = createLucideIcon("message-circle", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$4);
const __iconNode$3 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }]
];
const PanelRight = createLucideIcon("panel-right", __iconNode$3);
const __iconNode$2 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const SquareCheck = createLucideIcon("square-check", __iconNode$2);
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const SquareX = createLucideIcon("square-x", __iconNode$1);
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode);
const _sfc_main$r = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenu",
  __ssrInlineRender: true,
  props: {
    defaultOpen: { type: Boolean },
    open: { type: Boolean },
    dir: {},
    modal: { type: Boolean }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const forwarded = useForwardPropsEmits(props, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuRoot), mergeProps({ "data-slot": "dropdown-menu" }, unref(forwarded), _attrs), {
        default: withCtx((slotProps, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", slotProps, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", slotProps)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$r = _sfc_main$r.setup;
_sfc_main$r.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenu.vue");
  return _sfc_setup$r ? _sfc_setup$r(props, ctx) : void 0;
};
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuCheckboxItem",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: [Boolean, String] },
    disabled: { type: Boolean },
    textValue: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["select", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideCheck = Check;
      _push(ssrRenderComponent(unref(DropdownMenuCheckboxItem), mergeProps({ "data-slot": "dropdown-menu-checkbox-item" }, unref(forwarded), {
        class: unref(cn)(
          "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          props.class
        )
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(DropdownMenuItemIndicator), null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "indicator-icon", {}, () => {
                    _push3(ssrRenderComponent(_component_LucideCheck, { class: "size-4" }, null, _parent3, _scopeId2));
                  }, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "indicator-icon", {}, () => [
                      createVNode(_component_LucideCheck, { class: "size-4" })
                    ])
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            _push2(`</span>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              createVNode("span", { class: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center" }, [
                createVNode(unref(DropdownMenuItemIndicator), null, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "indicator-icon", {}, () => [
                      createVNode(_component_LucideCheck, { class: "size-4" })
                    ])
                  ]),
                  _: 3
                })
              ]),
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$q = _sfc_main$q.setup;
_sfc_main$q.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuCheckboxItem.vue");
  return _sfc_setup$q ? _sfc_setup$q(props, ctx) : void 0;
};
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "DropdownMenuContent",
  __ssrInlineRender: true,
  props: {
    forceMount: { type: Boolean },
    loop: { type: Boolean },
    side: {},
    sideOffset: { default: 4 },
    sideFlip: { type: Boolean },
    align: {},
    alignOffset: {},
    alignFlip: { type: Boolean },
    avoidCollisions: { type: Boolean },
    collisionBoundary: {},
    collisionPadding: {},
    arrowPadding: {},
    hideShiftedArrow: { type: Boolean },
    sticky: {},
    hideWhenDetached: { type: Boolean },
    positionStrategy: {},
    updatePositionStrategy: {},
    disableUpdateOnLayoutShift: { type: Boolean },
    prioritizePosition: { type: Boolean },
    reference: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["escapeKeyDown", "pointerDownOutside", "focusOutside", "interactOutside", "closeAutoFocus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuPortal), _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(DropdownMenuContent), mergeProps({ "data-slot": "dropdown-menu-content" }, { ..._ctx.$attrs, ...unref(forwarded) }, {
              class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", props.class)
            }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "default")
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(DropdownMenuContent), mergeProps({ "data-slot": "dropdown-menu-content" }, { ..._ctx.$attrs, ...unref(forwarded) }, {
                class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md", props.class)
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default")
                ]),
                _: 3
              }, 16, ["class"])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$p = _sfc_main$p.setup;
_sfc_main$p.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuContent.vue");
  return _sfc_setup$p ? _sfc_setup$p(props, ctx) : void 0;
};
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuGroup",
  __ssrInlineRender: true,
  props: {
    asChild: { type: Boolean },
    as: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuGroup), mergeProps({ "data-slot": "dropdown-menu-group" }, props, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$o = _sfc_main$o.setup;
_sfc_main$o.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuGroup.vue");
  return _sfc_setup$o ? _sfc_setup$o(props, ctx) : void 0;
};
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuItem",
  __ssrInlineRender: true,
  props: {
    disabled: { type: Boolean },
    textValue: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] },
    inset: { type: Boolean },
    variant: { default: "default" }
  },
  setup(__props) {
    const props = __props;
    const delegatedProps = reactiveOmit(props, "inset", "variant", "class");
    const forwardedProps = useForwardProps(delegatedProps);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuItem), mergeProps({
        "data-slot": "dropdown-menu-item",
        "data-inset": __props.inset ? "" : void 0,
        "data-variant": __props.variant
      }, unref(forwardedProps), {
        class: unref(cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", props.class)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$n = _sfc_main$n.setup;
_sfc_main$n.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuItem.vue");
  return _sfc_setup$n ? _sfc_setup$n(props, ctx) : void 0;
};
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuLabel",
  __ssrInlineRender: true,
  props: {
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] },
    inset: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const delegatedProps = reactiveOmit(props, "class", "inset");
    const forwardedProps = useForwardProps(delegatedProps);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuLabel), mergeProps({
        "data-slot": "dropdown-menu-label",
        "data-inset": __props.inset ? "" : void 0
      }, unref(forwardedProps), {
        class: unref(cn)("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", props.class)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$m = _sfc_main$m.setup;
_sfc_main$m.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuLabel.vue");
  return _sfc_setup$m ? _sfc_setup$m(props, ctx) : void 0;
};
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuRadioGroup",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    asChild: { type: Boolean },
    as: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const forwarded = useForwardPropsEmits(props, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuRadioGroup), mergeProps({ "data-slot": "dropdown-menu-radio-group" }, unref(forwarded), _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$l = _sfc_main$l.setup;
_sfc_main$l.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuRadioGroup.vue");
  return _sfc_setup$l ? _sfc_setup$l(props, ctx) : void 0;
};
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuRadioItem",
  __ssrInlineRender: true,
  props: {
    value: {},
    disabled: { type: Boolean },
    textValue: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideCircle = Circle;
      _push(ssrRenderComponent(unref(DropdownMenuRadioItem), mergeProps({ "data-slot": "dropdown-menu-radio-item" }, unref(forwarded), {
        class: unref(cn)(
          "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          props.class
        )
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(DropdownMenuItemIndicator), null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "indicator-icon", {}, () => {
                    _push3(ssrRenderComponent(_component_LucideCircle, { class: "size-2 fill-current" }, null, _parent3, _scopeId2));
                  }, _push3, _parent3, _scopeId2);
                } else {
                  return [
                    renderSlot(_ctx.$slots, "indicator-icon", {}, () => [
                      createVNode(_component_LucideCircle, { class: "size-2 fill-current" })
                    ])
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
            _push2(`</span>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              createVNode("span", { class: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center" }, [
                createVNode(unref(DropdownMenuItemIndicator), null, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "indicator-icon", {}, () => [
                      createVNode(_component_LucideCircle, { class: "size-2 fill-current" })
                    ])
                  ]),
                  _: 3
                })
              ]),
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$k = _sfc_main$k.setup;
_sfc_main$k.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuRadioItem.vue");
  return _sfc_setup$k ? _sfc_setup$k(props, ctx) : void 0;
};
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuSeparator",
  __ssrInlineRender: true,
  props: {
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  setup(__props) {
    const props = __props;
    const delegatedProps = reactiveOmit(props, "class");
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuSeparator), mergeProps({ "data-slot": "dropdown-menu-separator" }, unref(delegatedProps), {
        class: unref(cn)("bg-border -mx-1 my-1 h-px", props.class)
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSeparator.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuShortcut",
  __ssrInlineRender: true,
  props: {
    class: { type: [Boolean, null, String, Object, Array] }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        "data-slot": "dropdown-menu-shortcut",
        class: unref(cn)("text-muted-foreground ml-auto text-xs tracking-widest", props.class)
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuShortcut.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuSub",
  __ssrInlineRender: true,
  props: {
    defaultOpen: { type: Boolean },
    open: { type: Boolean }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const forwarded = useForwardPropsEmits(props, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuSub), mergeProps({ "data-slot": "dropdown-menu-sub" }, unref(forwarded), _attrs), {
        default: withCtx((slotProps, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", slotProps, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", slotProps)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSub.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuSubContent",
  __ssrInlineRender: true,
  props: {
    forceMount: { type: Boolean },
    loop: { type: Boolean },
    sideOffset: {},
    sideFlip: { type: Boolean },
    alignOffset: {},
    alignFlip: { type: Boolean },
    avoidCollisions: { type: Boolean },
    collisionBoundary: {},
    collisionPadding: {},
    arrowPadding: {},
    hideShiftedArrow: { type: Boolean },
    sticky: {},
    hideWhenDetached: { type: Boolean },
    positionStrategy: {},
    updatePositionStrategy: {},
    disableUpdateOnLayoutShift: { type: Boolean },
    prioritizePosition: { type: Boolean },
    reference: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["escapeKeyDown", "pointerDownOutside", "focusOutside", "interactOutside", "entryFocus", "openAutoFocus", "closeAutoFocus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuSubContent), mergeProps({ "data-slot": "dropdown-menu-sub-content" }, unref(forwarded), {
        class: unref(cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", props.class)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSubContent.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuSubTrigger",
  __ssrInlineRender: true,
  props: {
    disabled: { type: Boolean },
    textValue: {},
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] },
    inset: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const delegatedProps = reactiveOmit(props, "class", "inset");
    const forwardedProps = useForwardProps(delegatedProps);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideChevronRight = ChevronRight;
      _push(ssrRenderComponent(unref(DropdownMenuSubTrigger), mergeProps({ "data-slot": "dropdown-menu-sub-trigger" }, unref(forwardedProps), {
        "data-inset": __props.inset ? "" : void 0,
        class: unref(cn)(
          "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground",
          props.class
        )
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(ssrRenderComponent(_component_LucideChevronRight, { class: "ml-auto size-4" }, null, _parent2, _scopeId));
          } else {
            return [
              renderSlot(_ctx.$slots, "default"),
              createVNode(_component_LucideChevronRight, { class: "ml-auto size-4" })
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuSubTrigger.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "DropdownMenuTrigger",
  __ssrInlineRender: true,
  props: {
    disabled: { type: Boolean },
    asChild: { type: Boolean },
    as: {}
  },
  setup(__props) {
    const props = __props;
    const forwardedProps = useForwardProps(props);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(DropdownMenuTrigger), mergeProps({ "data-slot": "dropdown-menu-trigger" }, unref(forwardedProps), _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/dropdown-menu/DropdownMenuTrigger.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const useChatStore = defineStore("chat", () => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const savedScrollPosition = ref(0);
  const messages = ref([]);
  const draftInput = ref("");
  function toggle() {
    isOpen.value = !isOpen.value;
  }
  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function setLoading(val) {
    isLoading.value = val;
  }
  function clearChat() {
    messages.value = [];
    isLoading.value = false;
    savedScrollPosition.value = 0;
    draftInput.value = "";
  }
  return {
    isOpen,
    isLoading,
    messages,
    savedScrollPosition,
    draftInput,
    toggle,
    open,
    close,
    setLoading,
    clearChat
  };
});
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "ExamHeader",
  __ssrInlineRender: true,
  props: {
    exams: {},
    examId: {},
    courseCode: {},
    solutionPdfUrl: {}
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const chatStore = useChatStore();
    const scrollRef = ref(null);
    const isVisible = ref(true);
    const isHovering = ref(false);
    const isDropdownOpen = ref(false);
    const isDownloadOpen = ref(false);
    const isSettingsOpen = ref(false);
    let hideTimer = null;
    const sortedExams = computed(
      () => [...props.exams].sort(
        (a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime()
      )
    );
    const selectedExam = computed(
      () => sortedExams.value.find((e) => e.id.toString() === props.examId) ?? null
    );
    const isInternalElementOpen = computed(
      () => isDropdownOpen.value || isDownloadOpen.value || isSettingsOpen.value
    );
    const hasDownload = computed(
      () => !!selectedExam.value?.pdf_url || !!props.solutionPdfUrl
    );
    const startHideTimer = () => {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!isHovering.value && !isInternalElementOpen.value) {
          isVisible.value = false;
        }
      }, 2500);
    };
    watch(
      () => chatStore.isOpen,
      (isOpen) => {
        isVisible.value = !isOpen;
        if (isOpen && hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      }
    );
    watch(isInternalElementOpen, (isOpen) => {
      if (isOpen) {
        isVisible.value = true;
        if (hideTimer) clearTimeout(hideTimer);
      } else {
        startHideTimer();
      }
    });
    watch(isDropdownOpen, async (val) => {
      if (!val) return;
      await nextTick();
      const activeEl = scrollRef.value?.querySelector('[data-current="true"]');
      activeEl?.scrollIntoView({ block: "center" });
    });
    const changeExam = (e) => {
      isDropdownOpen.value = false;
      router.push(`/search/${props.courseCode}/${e.id}`);
    };
    const downloadFile = async (url, filename) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const a = (void 0).createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch {
        (void 0).open(url, "_blank");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$2$1;
      const _component_LucideArrowLeft = ArrowLeft;
      const _component_DropdownMenu = _sfc_main$r;
      const _component_DropdownMenuTrigger = _sfc_main$e;
      const _component_LucideChevronDown = ChevronDown;
      const _component_DropdownMenuContent = _sfc_main$p;
      const _component_DropdownMenuItem = _sfc_main$n;
      const _component_LucideSquareCheck = SquareCheck;
      const _component_LucideDownload = Download;
      const _component_LucideLoader2 = LoaderCircle;
      const _component_LucideMessageSquare = MessageSquare;
      const _component_Dialog = _sfc_main$9$1;
      const _component_DialogTrigger = _sfc_main$s;
      const _component_LucideSettings = Settings;
      const _component_DialogContent = _sfc_main$6$1;
      const _component_DialogHeader = _sfc_main$3$1;
      const _component_DialogTitle = _sfc_main$1$1;
      const _component_DialogDescription = _sfc_main$5$1;
      const _component_SettingsDialogContent = __nuxt_component_8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "hidden lg:flex fixed top-0 left-0 right-0 z-50 px-4 pt-3 pointer-events-none items-start justify-between transition-all duration-300 ease-in-out",
          unref(isVisible) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        ]
      }, _attrs))}><div class="group flex items-center bg-background/80 backdrop-blur-md border border-border/60 rounded-full pointer-events-auto">`);
      _push(ssrRenderComponent(_component_Button, {
        size: "icon",
        variant: "ghost",
        class: "size-8 rounded-l-full rounded-r-none border-r border-border/40",
        onClick: ($event) => unref(router).push(`/search/${__props.courseCode}`)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_LucideArrowLeft, { class: "w-4 h-4" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_LucideArrowLeft, { class: "w-4 h-4" })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(selectedExam)) {
        _push(ssrRenderComponent(_component_DropdownMenu, {
          open: unref(isDropdownOpen),
          "onUpdate:open": ($event) => isRef(isDropdownOpen) ? isDropdownOpen.value = $event : null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_DropdownMenuTrigger, { "as-child": "" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_Button, {
                      variant: "ghost",
                      size: "sm",
                      class: "rounded-r-full rounded-l-none h-8 px-3 font-normal hover:bg-accent/50"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<span class="text-xs font-semibold"${_scopeId3}>${ssrInterpolate(unref(selectedExam).exam_name.replace(unref(selectedExam).exam_date, "").trim())}</span><span class="text-muted-foreground text-xs"${_scopeId3}>${ssrInterpolate(unref(selectedExam).exam_date)}</span>`);
                          _push4(ssrRenderComponent(_component_LucideChevronDown, {
                            class: ["w-5 h-5 text-muted-foreground transition-transform duration-200", { "rotate-180": unref(isDropdownOpen) }]
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode("span", { class: "text-xs font-semibold" }, toDisplayString(unref(selectedExam).exam_name.replace(unref(selectedExam).exam_date, "").trim()), 1),
                            createVNode("span", { class: "text-muted-foreground text-xs" }, toDisplayString(unref(selectedExam).exam_date), 1),
                            createVNode(_component_LucideChevronDown, {
                              class: ["w-5 h-5 text-muted-foreground transition-transform duration-200", { "rotate-180": unref(isDropdownOpen) }]
                            }, null, 8, ["class"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_Button, {
                        variant: "ghost",
                        size: "sm",
                        class: "rounded-r-full rounded-l-none h-8 px-3 font-normal hover:bg-accent/50"
                      }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-xs font-semibold" }, toDisplayString(unref(selectedExam).exam_name.replace(unref(selectedExam).exam_date, "").trim()), 1),
                          createVNode("span", { class: "text-muted-foreground text-xs" }, toDisplayString(unref(selectedExam).exam_date), 1),
                          createVNode(_component_LucideChevronDown, {
                            class: ["w-5 h-5 text-muted-foreground transition-transform duration-200", { "rotate-180": unref(isDropdownOpen) }]
                          }, null, 8, ["class"])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_DropdownMenuContent, {
                align: "start",
                "side-offset": 8,
                class: "w-80 p-0 overflow-hidden"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/30 border-b"${_scopeId2}> Välj tenta (${ssrInterpolate(unref(sortedExams).length)}) </div><div class="max-h-87.5 overflow-y-auto p-1"${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(sortedExams), (e) => {
                      _push3(ssrRenderComponent(_component_DropdownMenuItem, {
                        key: e.id,
                        "data-current": e.id.toString() === __props.examId,
                        class: [
                          "flex items-center justify-between px-2 py-2.5 cursor-pointer rounded-md mb-0.5",
                          e.id.toString() === __props.examId ? "bg-primary/10 text-primary focus:bg-primary/15" : ""
                        ],
                        onClick: ($event) => changeExam(e)
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<div class="flex-1 min-w-0 pr-2"${_scopeId3}><div class="font-medium truncate text-sm"${_scopeId3}>${ssrInterpolate(e.exam_name.replace(e.exam_date, "").trim())}</div><div class="text-[11px] text-muted-foreground mt-0.5 capitalize"${_scopeId3}>${ssrInterpolate(new Intl.DateTimeFormat("sv-SE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            }).format(new Date(e.exam_date)))}</div></div><div class="flex items-center gap-2"${_scopeId3}>`);
                            if (e.has_solution) {
                              _push4(`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"${_scopeId3}> FACIT </span>`);
                            } else {
                              _push4(`<!---->`);
                            }
                            if (e.id.toString() === __props.examId) {
                              _push4(ssrRenderComponent(_component_LucideSquareCheck, { class: "w-4 h-4 text-primary" }, null, _parent4, _scopeId3));
                            } else {
                              _push4(`<!---->`);
                            }
                            _push4(`</div>`);
                          } else {
                            return [
                              createVNode("div", { class: "flex-1 min-w-0 pr-2" }, [
                                createVNode("div", { class: "font-medium truncate text-sm" }, toDisplayString(e.exam_name.replace(e.exam_date, "").trim()), 1),
                                createVNode("div", { class: "text-[11px] text-muted-foreground mt-0.5 capitalize" }, toDisplayString(new Intl.DateTimeFormat("sv-SE", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                }).format(new Date(e.exam_date))), 1)
                              ]),
                              createVNode("div", { class: "flex items-center gap-2" }, [
                                e.has_solution ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                }, " FACIT ")) : createCommentVNode("", true),
                                e.id.toString() === __props.examId ? (openBlock(), createBlock(_component_LucideSquareCheck, {
                                  key: 1,
                                  class: "w-4 h-4 text-primary"
                                })) : createCommentVNode("", true)
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]--></div>`);
                  } else {
                    return [
                      createVNode("div", { class: "px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/30 border-b" }, " Välj tenta (" + toDisplayString(unref(sortedExams).length) + ") ", 1),
                      createVNode("div", {
                        ref_key: "scrollRef",
                        ref: scrollRef,
                        class: "max-h-87.5 overflow-y-auto p-1"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedExams), (e) => {
                          return openBlock(), createBlock(_component_DropdownMenuItem, {
                            key: e.id,
                            "data-current": e.id.toString() === __props.examId,
                            class: [
                              "flex items-center justify-between px-2 py-2.5 cursor-pointer rounded-md mb-0.5",
                              e.id.toString() === __props.examId ? "bg-primary/10 text-primary focus:bg-primary/15" : ""
                            ],
                            onClick: ($event) => changeExam(e)
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "flex-1 min-w-0 pr-2" }, [
                                createVNode("div", { class: "font-medium truncate text-sm" }, toDisplayString(e.exam_name.replace(e.exam_date, "").trim()), 1),
                                createVNode("div", { class: "text-[11px] text-muted-foreground mt-0.5 capitalize" }, toDisplayString(new Intl.DateTimeFormat("sv-SE", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                }).format(new Date(e.exam_date))), 1)
                              ]),
                              createVNode("div", { class: "flex items-center gap-2" }, [
                                e.has_solution ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                }, " FACIT ")) : createCommentVNode("", true),
                                e.id.toString() === __props.examId ? (openBlock(), createBlock(_component_LucideSquareCheck, {
                                  key: 1,
                                  class: "w-4 h-4 text-primary"
                                })) : createCommentVNode("", true)
                              ])
                            ]),
                            _: 2
                          }, 1032, ["data-current", "class", "onClick"]);
                        }), 128))
                      ], 512)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_DropdownMenuTrigger, { "as-child": "" }, {
                  default: withCtx(() => [
                    createVNode(_component_Button, {
                      variant: "ghost",
                      size: "sm",
                      class: "rounded-r-full rounded-l-none h-8 px-3 font-normal hover:bg-accent/50"
                    }, {
                      default: withCtx(() => [
                        createVNode("span", { class: "text-xs font-semibold" }, toDisplayString(unref(selectedExam).exam_name.replace(unref(selectedExam).exam_date, "").trim()), 1),
                        createVNode("span", { class: "text-muted-foreground text-xs" }, toDisplayString(unref(selectedExam).exam_date), 1),
                        createVNode(_component_LucideChevronDown, {
                          class: ["w-5 h-5 text-muted-foreground transition-transform duration-200", { "rotate-180": unref(isDropdownOpen) }]
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_DropdownMenuContent, {
                  align: "start",
                  "side-offset": 8,
                  class: "w-80 p-0 overflow-hidden"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/30 border-b" }, " Välj tenta (" + toDisplayString(unref(sortedExams).length) + ") ", 1),
                    createVNode("div", {
                      ref_key: "scrollRef",
                      ref: scrollRef,
                      class: "max-h-87.5 overflow-y-auto p-1"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedExams), (e) => {
                        return openBlock(), createBlock(_component_DropdownMenuItem, {
                          key: e.id,
                          "data-current": e.id.toString() === __props.examId,
                          class: [
                            "flex items-center justify-between px-2 py-2.5 cursor-pointer rounded-md mb-0.5",
                            e.id.toString() === __props.examId ? "bg-primary/10 text-primary focus:bg-primary/15" : ""
                          ],
                          onClick: ($event) => changeExam(e)
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "flex-1 min-w-0 pr-2" }, [
                              createVNode("div", { class: "font-medium truncate text-sm" }, toDisplayString(e.exam_name.replace(e.exam_date, "").trim()), 1),
                              createVNode("div", { class: "text-[11px] text-muted-foreground mt-0.5 capitalize" }, toDisplayString(new Intl.DateTimeFormat("sv-SE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }).format(new Date(e.exam_date))), 1)
                            ]),
                            createVNode("div", { class: "flex items-center gap-2" }, [
                              e.has_solution ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              }, " FACIT ")) : createCommentVNode("", true),
                              e.id.toString() === __props.examId ? (openBlock(), createBlock(_component_LucideSquareCheck, {
                                key: 1,
                                class: "w-4 h-4 text-primary"
                              })) : createCommentVNode("", true)
                            ])
                          ]),
                          _: 2
                        }, 1032, ["data-current", "class", "onClick"]);
                      }), 128))
                    ], 512)
                  ]),
                  _: 2
                }, 1024)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center bg-background/80 backdrop-blur-md border border-border/60 rounded-full pointer-events-auto overflow-hidden">`);
      _push(ssrRenderComponent(_component_DropdownMenu, {
        open: unref(isDownloadOpen),
        "onUpdate:open": ($event) => isRef(isDownloadOpen) ? isDownloadOpen.value = $event : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_DropdownMenuTrigger, { "as-child": "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_Button, {
                    variant: "ghost",
                    size: "sm",
                    class: "rounded-none h-8 px-3 font-normal border-r border-border/40",
                    disabled: !unref(hasDownload)
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-xs"${_scopeId3}>Ladda ned</span>`);
                        _push4(ssrRenderComponent(_component_LucideChevronDown, { class: "w-4 h-4 text-muted-foreground" }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode("span", { class: "text-xs" }, "Ladda ned"),
                          createVNode(_component_LucideChevronDown, { class: "w-4 h-4 text-muted-foreground" })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_Button, {
                      variant: "ghost",
                      size: "sm",
                      class: "rounded-none h-8 px-3 font-normal border-r border-border/40",
                      disabled: !unref(hasDownload)
                    }, {
                      default: withCtx(() => [
                        createVNode("span", { class: "text-xs" }, "Ladda ned"),
                        createVNode(_component_LucideChevronDown, { class: "w-4 h-4 text-muted-foreground" })
                      ]),
                      _: 1
                    }, 8, ["disabled"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_DropdownMenuContent, {
              align: "end",
              "side-offset": 8
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_DropdownMenuItem, {
                    class: "gap-2 text-sm cursor-pointer",
                    disabled: !unref(selectedExam)?.pdf_url,
                    onClick: ($event) => downloadFile(
                      unref(selectedExam).pdf_url,
                      `${unref(selectedExam).course_code}_${unref(selectedExam).exam_date}_EXAM.pdf`
                    )
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_LucideDownload, { class: "w-4 h-4" }, null, _parent4, _scopeId3));
                        _push4(` Ladda ned tenta `);
                      } else {
                        return [
                          createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                          createTextVNode(" Ladda ned tenta ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_DropdownMenuItem, {
                    class: "gap-2 text-sm cursor-pointer",
                    disabled: !__props.solutionPdfUrl,
                    onClick: ($event) => downloadFile(
                      __props.solutionPdfUrl,
                      `${unref(selectedExam)?.course_code}_${unref(selectedExam)?.exam_date}_SOLUTION.pdf`
                    )
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_LucideDownload, { class: "w-4 h-4" }, null, _parent4, _scopeId3));
                        _push4(` Ladda ned facit `);
                      } else {
                        return [
                          createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                          createTextVNode(" Ladda ned facit ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_DropdownMenuItem, {
                      class: "gap-2 text-sm cursor-pointer",
                      disabled: !unref(selectedExam)?.pdf_url,
                      onClick: ($event) => downloadFile(
                        unref(selectedExam).pdf_url,
                        `${unref(selectedExam).course_code}_${unref(selectedExam).exam_date}_EXAM.pdf`
                      )
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                        createTextVNode(" Ladda ned tenta ")
                      ]),
                      _: 1
                    }, 8, ["disabled", "onClick"]),
                    createVNode(_component_DropdownMenuItem, {
                      class: "gap-2 text-sm cursor-pointer",
                      disabled: !__props.solutionPdfUrl,
                      onClick: ($event) => downloadFile(
                        __props.solutionPdfUrl,
                        `${unref(selectedExam)?.course_code}_${unref(selectedExam)?.exam_date}_SOLUTION.pdf`
                      )
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                        createTextVNode(" Ladda ned facit ")
                      ]),
                      _: 1
                    }, 8, ["disabled", "onClick"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_DropdownMenuTrigger, { "as-child": "" }, {
                default: withCtx(() => [
                  createVNode(_component_Button, {
                    variant: "ghost",
                    size: "sm",
                    class: "rounded-none h-8 px-3 font-normal border-r border-border/40",
                    disabled: !unref(hasDownload)
                  }, {
                    default: withCtx(() => [
                      createVNode("span", { class: "text-xs" }, "Ladda ned"),
                      createVNode(_component_LucideChevronDown, { class: "w-4 h-4 text-muted-foreground" })
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ]),
                _: 1
              }),
              createVNode(_component_DropdownMenuContent, {
                align: "end",
                "side-offset": 8
              }, {
                default: withCtx(() => [
                  createVNode(_component_DropdownMenuItem, {
                    class: "gap-2 text-sm cursor-pointer",
                    disabled: !unref(selectedExam)?.pdf_url,
                    onClick: ($event) => downloadFile(
                      unref(selectedExam).pdf_url,
                      `${unref(selectedExam).course_code}_${unref(selectedExam).exam_date}_EXAM.pdf`
                    )
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                      createTextVNode(" Ladda ned tenta ")
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]),
                  createVNode(_component_DropdownMenuItem, {
                    class: "gap-2 text-sm cursor-pointer",
                    disabled: !__props.solutionPdfUrl,
                    onClick: ($event) => downloadFile(
                      __props.solutionPdfUrl,
                      `${unref(selectedExam)?.course_code}_${unref(selectedExam)?.exam_date}_SOLUTION.pdf`
                    )
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_LucideDownload, { class: "w-4 h-4" }),
                      createTextVNode(" Ladda ned facit ")
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Button, {
        variant: "ghost",
        size: "sm",
        class: "rounded-none h-8 px-3 gap-2 font-normal border-r border-border/40",
        onClick: ($event) => unref(chatStore).toggle()
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(chatStore).isLoading) {
              _push2(ssrRenderComponent(_component_LucideLoader2, { class: "size-3.5 animate-spin" }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_LucideMessageSquare, { class: "w-4 h-4" }, null, _parent2, _scopeId));
            }
            _push2(`<span class="text-xs"${_scopeId}>${ssrInterpolate(unref(chatStore).isOpen ? "Stäng" : "Chatt")}</span>`);
          } else {
            return [
              unref(chatStore).isLoading ? (openBlock(), createBlock(_component_LucideLoader2, {
                key: 0,
                class: "size-3.5 animate-spin"
              })) : (openBlock(), createBlock(_component_LucideMessageSquare, {
                key: 1,
                class: "w-4 h-4"
              })),
              createVNode("span", { class: "text-xs" }, toDisplayString(unref(chatStore).isOpen ? "Stäng" : "Chatt"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        open: unref(isSettingsOpen),
        "onUpdate:open": ($event) => isRef(isSettingsOpen) ? isSettingsOpen.value = $event : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_DialogTrigger, { "as-child": "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_Button, {
                    variant: "ghost",
                    size: "icon",
                    class: "size-8 rounded-none hover:bg-accent/50"
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
                      size: "icon",
                      class: "size-8 rounded-none hover:bg-accent/50"
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
            _push2(ssrRenderComponent(_component_DialogContent, { class: "max-w-md rounded-xl" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_DialogHeader, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_DialogTitle, null, {
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
                              _push5(`Anpassa din studieupplevelse`);
                            } else {
                              return [
                                createTextVNode("Anpassa din studieupplevelse")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_DialogTitle, null, {
                            default: withCtx(() => [
                              createTextVNode("Inställningar")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_DialogDescription, null, {
                            default: withCtx(() => [
                              createTextVNode("Anpassa din studieupplevelse")
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
                        createVNode(_component_DialogTitle, null, {
                          default: withCtx(() => [
                            createTextVNode("Inställningar")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_DialogDescription, null, {
                          default: withCtx(() => [
                            createTextVNode("Anpassa din studieupplevelse")
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
                    size: "icon",
                    class: "size-8 rounded-none hover:bg-accent/50"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_LucideSettings, { class: "w-4.5 h-4.5" })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_DialogContent, { class: "max-w-md rounded-xl" }, {
                default: withCtx(() => [
                  createVNode(_component_DialogHeader, null, {
                    default: withCtx(() => [
                      createVNode(_component_DialogTitle, null, {
                        default: withCtx(() => [
                          createTextVNode("Inställningar")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_DialogDescription, null, {
                        default: withCtx(() => [
                          createTextVNode("Anpassa din studieupplevelse")
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
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExamHeader.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const __nuxt_component_0$1 = Object.assign(_sfc_main$d, { __name: "ExamHeader" });
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "GradientIndicator",
  __ssrInlineRender: true,
  props: {
    facitPdfUrl: {},
    label: {}
  },
  setup(__props) {
    const spring = ref(0);
    const colorMode = useColorMode();
    const isDark = computed(() => colorMode.value === "dark");
    const gradientOpacity = computed(() => {
      const v = spring.value;
      return isDark.value ? 0.08 + v * 0.3 : 0.16 + v * 0.45;
    });
    const backgroundImage = computed(() => {
      const o = gradientOpacity.value;
      return `radial-gradient(ellipse 90px 42% at 100% 50%, oklch(0.6193 0.1154 172.06 / ${o}) 0%, oklch(0.6193 0.1154 172.06 / ${o * 0.7}) 22%, oklch(0.6193 0.1154 172.06 / ${o * 0.28}) 48%, transparent 72%)`;
    });
    const iconOpacity = computed(() => 0.5 + spring.value * 0.5);
    const arrowX = computed(() => `${ -10 + spring.value * -20}px`);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideArrowLeftToLine = ArrowLeftToLine;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "absolute right-0 top-0 h-full w-28 pointer-events-none",
        style: { backgroundImage: unref(backgroundImage) }
      }, _attrs))}><div class="absolute right-0 flex items-center h-full pr-2" style="${ssrRenderStyle({ opacity: unref(iconOpacity), transform: `translateX(${unref(arrowX)})` })}">`);
      if (__props.facitPdfUrl) {
        _push(`<div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_LucideArrowLeftToLine, { class: "w-5 h-5 text-primary" }, null, _parent));
        _push(`<span class="text-xs font-normal text-primary hidden md:block">${ssrInterpolate(__props.label ?? "Facit")}</span></div>`);
      } else {
        _push(`<p class="text-xs hidden md:flex text-muted-foreground"> Ej tillgängligt </p>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GradientIndicator.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$c, { __name: "GradientIndicator" });
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "ResizeHandle",
  __ssrInlineRender: true,
  props: {
    isResizing: { type: Boolean }
  },
  emits: ["startResize"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideGripVertical = GripVertical;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "absolute top-0 bottom-0 w-5 z-100 cursor-col-resize flex items-center justify-center group touch-none select-none outline-none left-0 -translate-x-1/2" }, _attrs))}><div class="${ssrRenderClass([__props.isResizing ? "bg-primary" : "bg-border group-hover:bg-primary/50", "absolute inset-y-0 w-0.5 transition-colors duration-200"])}"></div><div class="${ssrRenderClass([
        __props.isResizing ? "border-primary ring-2 ring-primary/20 scale-110" : "border-border group-hover:border-primary/50",
        "relative flex h-8 w-4 items-center justify-center rounded-sm border shadow-sm transition-all duration-200 bg-background"
      ])}">`);
      _push(ssrRenderComponent(_component_LucideGripVertical, {
        class: ["h-4 w-4 transition-colors", __props.isResizing ? "text-primary" : "text-muted-foreground"]
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ResizeHandle.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$b, { __name: "ResizeHandle" });
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "ChatHeader",
  __ssrInlineRender: true,
  props: {
    hasSolution: { type: Boolean }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$2$1;
      const _component_LucideChevronRight = ChevronRight;
      const _component_LucideCircleCheck = CircleCheck;
      const _component_LucideSquareX = SquareX;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_LucideMessageCircle = MessageCircle;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "shrink-0 flex items-center justify-between px-3 py-2 z-100" }, _attrs))}><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Button, {
        variant: "ghost",
        size: "icon",
        class: "size-8",
        onClick: ($event) => emit("close")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_LucideChevronRight, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_LucideChevronRight)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="${ssrRenderClass([
        __props.hasSolution ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted/50 text-muted-foreground",
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-default"
      ])}">`);
      if (__props.hasSolution) {
        _push(ssrRenderComponent(_component_LucideCircleCheck, { class: "w-4 h-4" }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_LucideSquareX, { class: "w-4 h-4" }, null, _parent));
      }
      _push(`<span class="font-medium">Lösning</span></div></div><div class="flex items-center gap-1">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/feedback",
        target: "_blank"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Button, {
              variant: "ghost",
              size: "sm",
              class: "h-8 gap-1.5 text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_LucideMessageCircle, null, null, _parent3, _scopeId2));
                  _push3(` Feedback `);
                } else {
                  return [
                    createVNode(_component_LucideMessageCircle),
                    createTextVNode(" Feedback ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Button, {
                variant: "ghost",
                size: "sm",
                class: "h-8 gap-1.5 text-xs"
              }, {
                default: withCtx(() => [
                  createVNode(_component_LucideMessageCircle),
                  createTextVNode(" Feedback ")
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
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatHeader.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$a, { __name: "ChatHeader" });
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "Tooltip",
  __ssrInlineRender: true,
  props: {
    defaultOpen: { type: Boolean },
    open: { type: Boolean },
    delayDuration: {},
    disableHoverableContent: { type: Boolean },
    disableClosingTrigger: { type: Boolean },
    disabled: { type: Boolean },
    ignoreNonKeyboardFocus: { type: Boolean }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const forwarded = useForwardPropsEmits(props, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipRoot), mergeProps({ "data-slot": "tooltip" }, unref(forwarded), _attrs), {
        default: withCtx((slotProps, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", slotProps, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", slotProps)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/tooltip/Tooltip.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "TooltipContent",
  __ssrInlineRender: true,
  props: {
    forceMount: { type: Boolean },
    ariaLabel: {},
    asChild: { type: Boolean },
    as: {},
    side: {},
    sideOffset: { default: 4 },
    align: {},
    alignOffset: {},
    avoidCollisions: { type: Boolean },
    collisionBoundary: {},
    collisionPadding: {},
    arrowPadding: {},
    sticky: {},
    hideWhenDetached: { type: Boolean },
    positionStrategy: {},
    updatePositionStrategy: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["escapeKeyDown", "pointerDownOutside"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipPortal), _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(TooltipContent), mergeProps({ "data-slot": "tooltip-content" }, { ...unref(forwarded), ..._ctx.$attrs }, {
              class: unref(cn)("bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance", props.class)
            }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push3, _parent3, _scopeId2);
                  _push3(ssrRenderComponent(unref(TooltipArrow), { class: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" }, null, _parent3, _scopeId2));
                } else {
                  return [
                    renderSlot(_ctx.$slots, "default"),
                    createVNode(unref(TooltipArrow), { class: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
                  ];
                }
              }),
              _: 3
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(TooltipContent), mergeProps({ "data-slot": "tooltip-content" }, { ...unref(forwarded), ..._ctx.$attrs }, {
                class: unref(cn)("bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance", props.class)
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default"),
                  createVNode(unref(TooltipArrow), { class: "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
                ]),
                _: 3
              }, 16, ["class"])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/tooltip/TooltipContent.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "TooltipProvider",
  __ssrInlineRender: true,
  props: {
    delayDuration: { default: 0 },
    skipDelayDuration: {},
    disableHoverableContent: { type: Boolean },
    disableClosingTrigger: { type: Boolean },
    disabled: { type: Boolean },
    ignoreNonKeyboardFocus: { type: Boolean },
    content: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipProvider), mergeProps(props, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/tooltip/TooltipProvider.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "TooltipTrigger",
  __ssrInlineRender: true,
  props: {
    reference: {},
    asChild: { type: Boolean },
    as: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipTrigger), mergeProps({ "data-slot": "tooltip-trigger" }, props, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/tooltip/TooltipTrigger.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const MAX_LENGTH = 4e3;
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "ChatInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    isLoading: { type: Boolean },
    giveDirectAnswer: { type: Boolean },
    selectedModelId: {},
    showScrollButton: { type: Boolean }
  },
  emits: ["update:modelValue", "send", "cancel", "scrollToBottom", "update:giveDirectAnswer", "update:selectedModelId"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const textareaRef = ref(null);
    const isMultiline = ref(false);
    const models = [
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
      { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (stable)" }
    ];
    const selectedModel = computed(
      () => models.find((m) => m.id === props.selectedModelId) ?? models[0]
    );
    const updateHeight = () => {
      const el = textareaRef.value;
      if (!el) return;
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 200);
      el.style.height = `${newHeight}px`;
      isMultiline.value = newHeight > 44;
    };
    watch(
      () => props.modelValue,
      (val) => {
        if (val === "") nextTick(updateHeight);
      }
    );
    __expose({ focus: () => textareaRef.value?.focus() });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$2$1;
      const _component_LucideArrowDown = ArrowDown;
      const _component_DropdownMenu = _sfc_main$r;
      const _component_DropdownMenuTrigger = _sfc_main$e;
      const _component_LucideChevronDown = ChevronDown;
      const _component_DropdownMenuContent = _sfc_main$p;
      const _component_DropdownMenuItem = _sfc_main$n;
      const _component_LucideCheck = Check;
      const _component_TooltipProvider = _sfc_main$7;
      const _component_Tooltip = _sfc_main$9;
      const _component_TooltipTrigger = _sfc_main$6;
      const _component_LucideLightbulb = Lightbulb;
      const _component_TooltipContent = _sfc_main$8;
      const _component_LucideSquare = Square;
      const _component_LucideArrowUp = ArrowUp;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "px-4 bg-transparent relative w-full pointer-events-auto z-10" }, _attrs))} data-v-ab4ce52d><div class="max-w-2xl mx-auto relative" data-v-ab4ce52d>`);
      if (__props.showScrollButton) {
        _push(`<div class="absolute -top-12 left-1/2 -translate-x-1/2 z-20" data-v-ab4ce52d>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "outline",
          size: "icon",
          class: "rounded-full shadow-md bg-background",
          onClick: ($event) => emit("scrollToBottom")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_LucideArrowDown, { class: "w-5 h-5" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_LucideArrowDown, { class: "w-5 h-5" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([unref(isMultiline) ? "rounded-2xl" : "rounded-[28px]", "relative border border-border bg-background dark:bg-secondary shadow-sm transition-all duration-200"])}" data-v-ab4ce52d><div class="flex flex-col w-full p-2" data-v-ab4ce52d><textarea placeholder="Fråga om tentan..." class="w-full bg-background dark:bg-secondary outline-none border-0 focus:ring-0 resize-none px-3 pt-2 pb-1 text-sm leading-relaxed min-h-10 max-h-50 custom-scrollbar" rows="1" data-v-ab4ce52d>${ssrInterpolate(__props.modelValue)}</textarea><div class="flex items-center justify-between px-2 pb-1 pt-1" data-v-ab4ce52d><div class="flex items-center gap-1.5" data-v-ab4ce52d>`);
      _push(ssrRenderComponent(_component_DropdownMenu, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_DropdownMenuTrigger, { "as-child": "" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<button class="flex items-center gap-1 h-7 px-2 rounded-lg hover:bg-accent text-[11px] font-semibold text-muted-foreground transition-colors" data-v-ab4ce52d${_scopeId2}>${ssrInterpolate(unref(selectedModel).name)} `);
                  _push3(ssrRenderComponent(_component_LucideChevronDown, { class: "w-5 h-5 opacity-50" }, null, _parent3, _scopeId2));
                  _push3(`</button>`);
                } else {
                  return [
                    createVNode("button", { class: "flex items-center gap-1 h-7 px-2 rounded-lg hover:bg-accent text-[11px] font-semibold text-muted-foreground transition-colors" }, [
                      createTextVNode(toDisplayString(unref(selectedModel).name) + " ", 1),
                      createVNode(_component_LucideChevronDown, { class: "w-5 h-5 opacity-50" })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_DropdownMenuContent, {
              align: "start",
              side: "top",
              class: "w-56"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<!--[-->`);
                  ssrRenderList(models, (m) => {
                    _push3(ssrRenderComponent(_component_DropdownMenuItem, {
                      key: m.id,
                      class: "text-xs justify-between cursor-pointer",
                      onClick: ($event) => emit("update:selectedModelId", m.id)
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`${ssrInterpolate(m.name)} `);
                          if (m.id === __props.selectedModelId) {
                            _push4(ssrRenderComponent(_component_LucideCheck, { class: "w-5 h-5 text-primary" }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                        } else {
                          return [
                            createTextVNode(toDisplayString(m.name) + " ", 1),
                            m.id === __props.selectedModelId ? (openBlock(), createBlock(_component_LucideCheck, {
                              key: 0,
                              class: "w-5 h-5 text-primary"
                            })) : createCommentVNode("", true)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  });
                  _push3(`<!--]-->`);
                } else {
                  return [
                    (openBlock(), createBlock(Fragment, null, renderList(models, (m) => {
                      return createVNode(_component_DropdownMenuItem, {
                        key: m.id,
                        class: "text-xs justify-between cursor-pointer",
                        onClick: ($event) => emit("update:selectedModelId", m.id)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(m.name) + " ", 1),
                          m.id === __props.selectedModelId ? (openBlock(), createBlock(_component_LucideCheck, {
                            key: 0,
                            class: "w-5 h-5 text-primary"
                          })) : createCommentVNode("", true)
                        ]),
                        _: 2
                      }, 1032, ["onClick"]);
                    }), 64))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_DropdownMenuTrigger, { "as-child": "" }, {
                default: withCtx(() => [
                  createVNode("button", { class: "flex items-center gap-1 h-7 px-2 rounded-lg hover:bg-accent text-[11px] font-semibold text-muted-foreground transition-colors" }, [
                    createTextVNode(toDisplayString(unref(selectedModel).name) + " ", 1),
                    createVNode(_component_LucideChevronDown, { class: "w-5 h-5 opacity-50" })
                  ])
                ]),
                _: 1
              }),
              createVNode(_component_DropdownMenuContent, {
                align: "start",
                side: "top",
                class: "w-56"
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(Fragment, null, renderList(models, (m) => {
                    return createVNode(_component_DropdownMenuItem, {
                      key: m.id,
                      class: "text-xs justify-between cursor-pointer",
                      onClick: ($event) => emit("update:selectedModelId", m.id)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(m.name) + " ", 1),
                        m.id === __props.selectedModelId ? (openBlock(), createBlock(_component_LucideCheck, {
                          key: 0,
                          class: "w-5 h-5 text-primary"
                        })) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1032, ["onClick"]);
                  }), 64))
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TooltipProvider, { "delay-duration": 0 }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Tooltip, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_TooltipTrigger, { "as-child": "" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<button class="${ssrRenderClass([
                          !__props.giveDirectAnswer ? "bg-primary/10 text-primary border-primary/20" : "border-dashed border-border text-muted-foreground hover:bg-accent",
                          "flex cursor-pointer items-center gap-1.5 px-2 h-7 rounded-lg border text-[11px] font-medium transition-all"
                        ])}" data-v-ab4ce52d${_scopeId3}>`);
                        if (__props.giveDirectAnswer) {
                          _push4(ssrRenderComponent(_component_LucideLightbulb, { class: "w-4 h-4" }, null, _parent4, _scopeId3));
                        } else {
                          _push4(ssrRenderComponent(_component_LucideLightbulb, { class: "w-4 h-4" }, null, _parent4, _scopeId3));
                        }
                        _push4(`<span class="hidden sm:inline" data-v-ab4ce52d${_scopeId3}>Hints</span></button>`);
                      } else {
                        return [
                          createVNode("button", {
                            class: [
                              "flex cursor-pointer items-center gap-1.5 px-2 h-7 rounded-lg border text-[11px] font-medium transition-all",
                              !__props.giveDirectAnswer ? "bg-primary/10 text-primary border-primary/20" : "border-dashed border-border text-muted-foreground hover:bg-accent"
                            ],
                            onClick: ($event) => emit("update:giveDirectAnswer", !__props.giveDirectAnswer)
                          }, [
                            __props.giveDirectAnswer ? (openBlock(), createBlock(_component_LucideLightbulb, {
                              key: 0,
                              class: "w-4 h-4"
                            })) : (openBlock(), createBlock(_component_LucideLightbulb, {
                              key: 1,
                              class: "w-4 h-4"
                            })),
                            createVNode("span", { class: "hidden sm:inline" }, "Hints")
                          ], 10, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_TooltipContent, {
                    side: "top",
                    align: "start"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<p class="text-xs" data-v-ab4ce52d${_scopeId3}>${ssrInterpolate(!__props.giveDirectAnswer ? "Pedagogiska ledtrådar på" : "Klicka för vägledning")}</p>`);
                      } else {
                        return [
                          createVNode("p", { class: "text-xs" }, toDisplayString(!__props.giveDirectAnswer ? "Pedagogiska ledtrådar på" : "Klicka för vägledning"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_TooltipTrigger, { "as-child": "" }, {
                      default: withCtx(() => [
                        createVNode("button", {
                          class: [
                            "flex cursor-pointer items-center gap-1.5 px-2 h-7 rounded-lg border text-[11px] font-medium transition-all",
                            !__props.giveDirectAnswer ? "bg-primary/10 text-primary border-primary/20" : "border-dashed border-border text-muted-foreground hover:bg-accent"
                          ],
                          onClick: ($event) => emit("update:giveDirectAnswer", !__props.giveDirectAnswer)
                        }, [
                          __props.giveDirectAnswer ? (openBlock(), createBlock(_component_LucideLightbulb, {
                            key: 0,
                            class: "w-4 h-4"
                          })) : (openBlock(), createBlock(_component_LucideLightbulb, {
                            key: 1,
                            class: "w-4 h-4"
                          })),
                          createVNode("span", { class: "hidden sm:inline" }, "Hints")
                        ], 10, ["onClick"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_TooltipContent, {
                      side: "top",
                      align: "start"
                    }, {
                      default: withCtx(() => [
                        createVNode("p", { class: "text-xs" }, toDisplayString(!__props.giveDirectAnswer ? "Pedagogiska ledtrådar på" : "Klicka för vägledning"), 1)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Tooltip, null, {
                default: withCtx(() => [
                  createVNode(_component_TooltipTrigger, { "as-child": "" }, {
                    default: withCtx(() => [
                      createVNode("button", {
                        class: [
                          "flex cursor-pointer items-center gap-1.5 px-2 h-7 rounded-lg border text-[11px] font-medium transition-all",
                          !__props.giveDirectAnswer ? "bg-primary/10 text-primary border-primary/20" : "border-dashed border-border text-muted-foreground hover:bg-accent"
                        ],
                        onClick: ($event) => emit("update:giveDirectAnswer", !__props.giveDirectAnswer)
                      }, [
                        __props.giveDirectAnswer ? (openBlock(), createBlock(_component_LucideLightbulb, {
                          key: 0,
                          class: "w-4 h-4"
                        })) : (openBlock(), createBlock(_component_LucideLightbulb, {
                          key: 1,
                          class: "w-4 h-4"
                        })),
                        createVNode("span", { class: "hidden sm:inline" }, "Hints")
                      ], 10, ["onClick"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_TooltipContent, {
                    side: "top",
                    align: "start"
                  }, {
                    default: withCtx(() => [
                      createVNode("p", { class: "text-xs" }, toDisplayString(!__props.giveDirectAnswer ? "Pedagogiska ledtrådar på" : "Klicka för vägledning"), 1)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center" data-v-ab4ce52d>`);
      if (__props.isLoading) {
        _push(ssrRenderComponent(_component_Button, {
          key: "stop",
          variant: "outline",
          size: "icon",
          class: "size-8 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive border-none",
          onClick: ($event) => emit("cancel")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_LucideSquare, { class: "size-3.5 fill-current" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_LucideSquare, { class: "size-3.5 fill-current" })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_Button, {
          key: "send",
          size: "icon",
          class: "size-8 rounded-full transition-transform active:scale-95",
          disabled: !__props.modelValue.trim() || __props.modelValue.length > MAX_LENGTH,
          onClick: ($event) => emit("send")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_LucideArrowUp, { class: "w-4 h-4" }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_LucideArrowUp, { class: "w-4 h-4" })
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div></div></div></div><div class="flex justify-between items-center mt-2 px-3" data-v-ab4ce52d><p class="text-[10px] text-muted-foreground/60" data-v-ab4ce52d>AI kan göra misstag.</p><p class="text-[10px] text-muted-foreground/60" data-v-ab4ce52d>Drivs av Gemini</p>`);
      if (__props.modelValue.length > MAX_LENGTH * 0.8) {
        _push(`<p class="${ssrRenderClass([
          __props.modelValue.length > MAX_LENGTH ? "text-destructive font-bold" : "text-muted-foreground",
          "text-[10px]"
        ])}" data-v-ab4ce52d>${ssrInterpolate(__props.modelValue.length)} / ${ssrInterpolate(MAX_LENGTH)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatInput.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$5, [["__scopeId", "data-v-ab4ce52d"]]), { __name: "ChatInput" });
const CHAT_API_URL = "https://liutentor-api-production.up.railway.app/api/v1/chat/completion";
function getAnonymousId() {
  return "unknown";
}
function useChat(options) {
  const chatStore = useChatStore();
  const abortController = ref(null);
  function cancelGeneration() {
    abortController.value?.abort();
    abortController.value = null;
    let cancelledUserMessage = null;
    const msgs = chatStore.messages;
    const last = msgs[msgs.length - 1];
    if (last?.role === "assistant") {
      if (!last.content.trim()) {
        const userMsg = msgs[msgs.length - 2];
        if (userMsg?.role === "user") cancelledUserMessage = userMsg.content;
        if (msgs.length === 2) {
          chatStore.messages = [
            ...msgs.slice(0, -1),
            { role: "assistant", content: "> *Avbruten av användaren*" }
          ];
        } else {
          chatStore.messages = msgs.slice(0, -2);
        }
      } else {
        chatStore.messages = [
          ...msgs.slice(0, -1),
          {
            role: "assistant",
            content: last.content.trim() + "\n\n> *Avbruten av användaren*"
          }
        ];
      }
    }
    chatStore.setLoading(false);
    return cancelledUserMessage;
  }
  async function send(content, opts = {}) {
    if (!content.trim() || chatStore.isLoading) return;
    const {
      giveDirectAnswer = true,
      modelId = "gemini-2.5-pro",
      context
    } = opts;
    const userMessage = {
      role: "user",
      content,
      ...context ? { context } : {}
    };
    chatStore.messages.push(userMessage);
    chatStore.messages.push({ role: "assistant", content: "" });
    chatStore.setLoading(true);
    abortController.value = new AbortController();
    try {
      const recentMessages = chatStore.messages.slice(0, -1).slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
        ...m.context ? { context: m.context } : {}
      }));
      const response = await fetch(`${CHAT_API_URL}/${options.examId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-user-id": getAnonymousId()
        },
        body: JSON.stringify({
          messages: recentMessages,
          giveDirectAnswer,
          examUrl: options.examUrl,
          courseCode: options.courseCode,
          solutionUrl: options.solutionUrl || void 0,
          modelId
        }),
        signal: abortController.value.signal
      });
      if (!response.ok) throw new Error("API error");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder("utf-8");
      let streamText = "";
      let lastUpdate = 0;
      const STREAM_UPDATE_INTERVAL = 50;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamText += decoder.decode(value, { stream: true });
        const now = Date.now();
        if (now - lastUpdate >= STREAM_UPDATE_INTERVAL) {
          lastUpdate = now;
          const updated = [...chatStore.messages];
          updated[updated.length - 1] = {
            role: "assistant",
            content: streamText
          };
          chatStore.messages = updated;
        }
      }
      const final = [...chatStore.messages];
      final[final.length - 1] = {
        role: "assistant",
        content: streamText.trim() || "Jag kunde inte generera ett svar."
      };
      chatStore.messages = final;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      const updated = [...chatStore.messages];
      updated[updated.length - 1] = {
        role: "assistant",
        content: "Något gick fel. Försök igen senare."
      };
      chatStore.messages = updated;
    } finally {
      abortController.value = null;
      chatStore.setLoading(false);
    }
  }
  return { send, cancelGeneration };
}
const MAX_RENDER_CACHE = 200;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ChatWindow",
  __ssrInlineRender: true,
  props: {
    examId: {},
    examUrl: {},
    courseCode: {},
    solutionUrl: {},
    hasSolution: { type: Boolean }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const chatStore = useChatStore();
    const { messages, isLoading, draftInput } = storeToRefs(chatStore);
    const { send, cancelGeneration } = useChat({
      examId: props.examId,
      examUrl: props.examUrl,
      courseCode: props.courseCode,
      solutionUrl: props.solutionUrl
    });
    const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
    md.use(markdownItKatex, { throwOnError: false });
    const renderCache = /* @__PURE__ */ new Map();
    function renderMarkdown(content) {
      return DOMPurify.sanitize(md.render(content), {
        ADD_TAGS: [
          "math",
          "semantics",
          "mrow",
          "mi",
          "mo",
          "mn",
          "msup",
          "msub",
          "mfrac",
          "mover",
          "munder",
          "mtext",
          "annotation"
        ],
        ADD_ATTR: ["xmlns", "encoding"]
      });
    }
    function getCachedMarkdown(content) {
      const cached = renderCache.get(content);
      if (cached) return cached;
      const rendered = renderMarkdown(content);
      renderCache.set(content, rendered);
      if (renderCache.size > MAX_RENDER_CACHE) {
        const oldestKey = renderCache.keys().next().value;
        if (oldestKey) renderCache.delete(oldestKey);
      }
      return rendered;
    }
    const giveDirectAnswer = ref(true);
    const selectedModelId = ref("gemini-3.1-pro-preview");
    const messagesEndRef = ref(null);
    const messagesContainer = ref(null);
    const chatInputRef = ref(null);
    const isUserScrolling = ref(false);
    const isAtBottom = ref(true);
    const showScrollButton = ref(false);
    const renderedAssistantHtml = computed(() => {
      const lastIndex = messages.value.length - 1;
      return messages.value.map((msg, i) => {
        if (msg.role !== "assistant" || !msg.content) return "";
        const isStreamingLast = isLoading.value && i === lastIndex;
        return isStreamingLast ? renderMarkdown(msg.content) : getCachedMarkdown(msg.content);
      });
    });
    function scrollToBottom(behavior = "smooth") {
      if (!messagesEndRef.value) return;
      const container = messagesContainer.value;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior
        });
      }
    }
    watch(
      messages,
      () => {
        if (isAtBottom.value) {
          nextTick(() => scrollToBottom("auto"));
        }
      },
      { deep: true }
    );
    async function handleSend() {
      if (!draftInput.value.trim() || isLoading.value) return;
      const text = draftInput.value;
      draftInput.value = "";
      isUserScrolling.value = false;
      await nextTick();
      scrollToBottom("smooth");
      await send(text, {
        giveDirectAnswer: giveDirectAnswer.value,
        modelId: selectedModelId.value
      });
    }
    function handleCancel() {
      const cancelled = cancelGeneration();
      if (cancelled) {
        draftInput.value = cancelled;
        chatInputRef.value?.focus();
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ChatHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_ChatInput = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full w-full flex flex-col border-l bg-background overflow-hidden relative z-50" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_ChatHeader, {
        "has-solution": __props.hasSolution,
        onClose: ($event) => emit("close")
      }, null, _parent));
      _push(`<div class="flex-1 min-h-0 relative"><div class="h-full w-full overflow-y-auto px-4 pt-4 custom-scrollbar">`);
      if (unref(messages).length === 0) {
        _push(`<div class="h-full flex flex-col items-center justify-center px-4 text-center pb-24"><h2 class="text-2xl font-medium mb-3 text-foreground tracking-tight"> Vad kan jag hjälpa till med? </h2><p class="text-muted-foreground text-sm max-w-70 sm:max-w-md mb-8 leading-relaxed"> Ställ frågor om tentan, be om ledtrådar eller få hjälp att förstå lösningarna. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/privacy-policy",
          target: "_blank",
          class: "text-[11px] text-muted-foreground/60 hover:text-foreground transition-all duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Läs vår AI-policy `);
            } else {
              return [
                createTextVNode(" Läs vår AI-policy ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-6 max-w-2xl mx-auto w-full"><!--[-->`);
        ssrRenderList(unref(messages), (msg, i) => {
          _push(`<div class="${ssrRenderClass(msg.role === "user" ? "flex justify-end" : "")}">`);
          if (msg.role === "user") {
            _push(`<div class="bg-muted text-foreground px-4 py-2.5 rounded-2xl max-w-[85%] w-fit"><p class="text-sm leading-relaxed whitespace-pre-wrap">${ssrInterpolate(msg.content)}</p></div>`);
          } else {
            _push(`<div class="w-full px-1 py-2">`);
            if (!msg.content && unref(isLoading) && i === unref(messages).length - 1) {
              _push(`<div class="flex items-center gap-2 h-6"><span class="text-sm text-muted-foreground animate-pulse">Tänker...</span></div>`);
            } else {
              _push(`<div class="prose prose-sm dark:prose-invert max-w-none">${unref(renderedAssistantHtml)[i] ?? ""}</div>`);
            }
            _push(`</div>`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--><div class="h-px w-full"></div><div class="h-32 w-full shrink-0"></div></div>`);
      }
      _push(`</div><div class="absolute bottom-0 left-0 right-0 pt-10 pb-4 bg-linear-to-t from-background via-background/95 to-transparent pointer-events-none z-10">`);
      _push(ssrRenderComponent(_component_ChatInput, {
        ref_key: "chatInputRef",
        ref: chatInputRef,
        modelValue: unref(draftInput),
        "onUpdate:modelValue": ($event) => isRef(draftInput) ? draftInput.value = $event : null,
        "is-loading": unref(isLoading),
        "give-direct-answer": giveDirectAnswer.value,
        "selected-model-id": selectedModelId.value,
        "show-scroll-button": showScrollButton.value,
        class: "pointer-events-auto",
        onSend: handleSend,
        onCancel: handleCancel,
        onScrollToBottom: ($event) => scrollToBottom("smooth"),
        "onUpdate:giveDirectAnswer": ($event) => giveDirectAnswer.value = $event,
        "onUpdate:selectedModelId": ($event) => selectedModelId.value = $event
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatWindow.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_8 = Object.assign(_sfc_main$4, { __name: "ChatWindow" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ExamOnlyView",
  __ssrInlineRender: true,
  props: {
    examPdfUrl: {},
    solutionPdfUrl: {}
  },
  setup(__props) {
    const props = __props;
    const chatStore = useChatStore();
    const route = useRoute();
    const isFacitVisible = ref(false);
    const isManual = ref(false);
    const isDragging = ref(false);
    ref(null);
    const panelWidth = ref(
      600
    );
    const hasFacit = computed(() => !!props.solutionPdfUrl);
    watch(
      () => chatStore.isOpen,
      (open) => {
        if (open) {
          isFacitVisible.value = false;
          isManual.value = false;
        }
      }
    );
    function startResize() {
      isDragging.value = true;
      const onMouseMove = (e) => {
        const newWidth = (void 0).innerWidth - e.clientX;
        panelWidth.value = Math.max(
          300,
          Math.min(newWidth, (void 0).innerWidth * 0.85)
        );
      };
      const onMouseUp = () => {
        isDragging.value = false;
        (void 0).removeEventListener("mousemove", onMouseMove);
        (void 0).removeEventListener("mouseup", onMouseUp);
      };
      (void 0).addEventListener("mousemove", onMouseMove);
      (void 0).addEventListener("mouseup", onMouseUp);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_4;
      const _component_GradientIndicator = __nuxt_component_1;
      const _component_ResizeHandle = __nuxt_component_5;
      const _component_ChatWindow = __nuxt_component_8;
      _push(`<!--[--><div class="${ssrRenderClass([{ "select-none": unref(isDragging) }, "w-full h-screen relative bg-background overflow-hidden"])}"><div class="absolute inset-0 z-0">`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
      if (unref(hasFacit) && !unref(isFacitVisible) && !unref(chatStore).isOpen) {
        _push(ssrRenderComponent(_component_GradientIndicator, { "facit-pdf-url": __props.solutionPdfUrl }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(hasFacit)) {
          _push2(`<div class="${ssrRenderClass([
            unref(isFacitVisible) && !unref(chatStore).isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
            "fixed right-0 top-0 h-full bg-background border-l shadow-2xl z-60 flex transition-transform duration-75 ease-in-out"
          ])}" style="${ssrRenderStyle({ width: `${unref(panelWidth)}px` })}">`);
          if (unref(isFacitVisible) && !unref(chatStore).isOpen) {
            _push2(`<div class="relative w-0 shrink-0">`);
            _push2(ssrRenderComponent(_component_ResizeHandle, {
              "is-resizing": unref(isDragging),
              onStartResize: startResize
            }, null, _parent));
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex-1 overflow-hidden">`);
          _push2(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(chatStore).isOpen) {
          _push2(`<div class="fixed right-0 top-0 h-full bg-background border-l shadow-2xl z-60 flex" style="${ssrRenderStyle({ width: `${unref(panelWidth)}px` })}"><div class="relative w-0 shrink-0">`);
          _push2(ssrRenderComponent(_component_ResizeHandle, {
            "is-resizing": unref(isDragging),
            onStartResize: startResize
          }, null, _parent));
          _push2(`</div><div class="flex-1 overflow-hidden">`);
          _push2(ssrRenderComponent(_component_ChatWindow, {
            "exam-id": String(unref(route).params.examId),
            "exam-url": __props.examPdfUrl,
            "course-code": String(unref(route).params.courseCode),
            "solution-url": __props.solutionPdfUrl,
            "has-solution": unref(hasFacit),
            class: "h-full w-full",
            onClose: ($event) => unref(chatStore).close()
          }, null, _parent));
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExamOnlyView.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$3, { __name: "ExamOnlyView" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "MobilePdfView",
  __ssrInlineRender: true,
  props: {
    examPdfUrl: {},
    solutionPdfUrl: {},
    courseCode: {},
    examDate: {}
  },
  setup(__props) {
    const props = __props;
    const showSolution = ref(false);
    const hasSolution = computed(() => !!props.solutionPdfUrl);
    watch(
      () => props.examPdfUrl,
      () => {
        showSolution.value = false;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_LucideArrowLeft = ArrowLeft;
      const _component_LucideBookOpen = BookOpen;
      const _component_ClientOnly = __nuxt_component_4;
      const _component_LucideX = X;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex lg:hidden flex-col h-screen w-full bg-background relative" }, _attrs))}><div class="absolute inset-x-0 top-0 z-40 flex items-center gap-3 px-3 h-12 bg-linear-to-b from-background to-transparent">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/search/${__props.courseCode}`,
        class: "shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-foreground active:scale-95 transition-transform",
        "aria-label": "Gå tillbaka"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_LucideArrowLeft, { class: "w-4 h-4" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_LucideArrowLeft, { class: "w-4 h-4" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="min-w-0 flex-1"><p class="text-sm font-bold text-foreground truncate leading-tight">${ssrInterpolate(__props.courseCode)}</p><p class="text-xs text-muted-foreground truncate leading-tight">${ssrInterpolate(__props.examDate)}</p></div>`);
      if (unref(hasSolution)) {
        _push(`<button class="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-background text-foreground text-xs active:scale-95 transition-transform">`);
        _push(ssrRenderComponent(_component_LucideBookOpen, { class: "w-3.5 h-3.5 text-primary" }, null, _parent));
        _push(` Facit </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="w-full h-full overflow-hidden pt-12">`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
      if (unref(showSolution)) {
        _push(`<section class="fixed inset-0 z-50 h-screen w-screen bg-background flex flex-col overflow-hidden" role="dialog" aria-modal="true"><div class="absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-3 h-12 bg-linear-to-b from-background to-transparent"><div class="min-w-0 flex-1"><p class="text-sm font-semibold text-foreground truncate leading-tight"> Facit </p><p class="text-xs text-muted-foreground truncate leading-tight">${ssrInterpolate(__props.courseCode)} - ${ssrInterpolate(__props.examDate)}</p></div><button class="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background text-foreground active:scale-95 transition-transform" aria-label="Stäng">`);
        _push(ssrRenderComponent(_component_LucideX, { class: "w-4 h-4" }, null, _parent));
        _push(`</button></div><div class="h-full w-full overflow-hidden pt-12">`);
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
        _push(`</div></section>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MobilePdfView.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$2, { __name: "MobilePdfView" });
function useLayoutMode() {
  const layoutModeCookie = useCookie(
    "layoutMode",
    {
      default: () => "exam-with-facit",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
    }
  );
  return {
    layoutMode: readonly(layoutModeCookie),
    setLayoutMode: (mode) => {
      layoutModeCookie.value = mode;
    }
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LayoutSwitcher",
  __ssrInlineRender: true,
  setup(__props) {
    const { layoutMode, setLayoutMode } = useLayoutMode();
    const isVisible = ref(true);
    const isHovering = ref(false);
    const modes = [
      { value: "exam-with-facit", label: "Tenta & Facit", icon: "split" },
      { value: "exam-only", label: "Endast tenta", icon: "half" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TooltipProvider = _sfc_main$7;
      const _component_Tooltip = _sfc_main$9;
      const _component_TooltipTrigger = _sfc_main$6;
      const _component_LucideColumns2 = Columns2;
      const _component_LucidePanelRight = PanelRight;
      const _component_TooltipContent = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "fixed bottom-10 left-5 z-40 hidden md:flex rounded-lg p-1 transition-opacity duration-300",
          unref(isVisible) || unref(isHovering) ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        ]
      }, _attrs))}><div class="flex items-center gap-0"><!--[-->`);
      ssrRenderList(modes, (mode) => {
        _push(ssrRenderComponent(_component_TooltipProvider, {
          key: mode.value,
          "delay-duration": 0
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Tooltip, null, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_TooltipTrigger, { "as-child": "" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<button class="${ssrRenderClass([[
                            mode.value === "exam-with-facit" ? "rounded-l-lg" : "rounded-r-lg",
                            unref(layoutMode) === mode.value ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                          ], "flex border items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer"])}"${_scopeId3}>`);
                          if (mode.icon === "split") {
                            _push4(ssrRenderComponent(_component_LucideColumns2, { class: "w-5 h-5" }, null, _parent4, _scopeId3));
                          } else {
                            _push4(ssrRenderComponent(_component_LucidePanelRight, { class: "w-5 h-5" }, null, _parent4, _scopeId3));
                          }
                          _push4(`</button>`);
                        } else {
                          return [
                            createVNode("button", {
                              class: ["flex border items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer", [
                                mode.value === "exam-with-facit" ? "rounded-l-lg" : "rounded-r-lg",
                                unref(layoutMode) === mode.value ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                              ]],
                              onClick: ($event) => unref(setLayoutMode)(mode.value)
                            }, [
                              mode.icon === "split" ? (openBlock(), createBlock(_component_LucideColumns2, {
                                key: 0,
                                class: "w-5 h-5"
                              })) : (openBlock(), createBlock(_component_LucidePanelRight, {
                                key: 1,
                                class: "w-5 h-5"
                              }))
                            ], 10, ["onClick"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_TooltipContent, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<p${_scopeId3}>${ssrInterpolate(mode.label)}</p>`);
                        } else {
                          return [
                            createVNode("p", null, toDisplayString(mode.label), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_TooltipTrigger, { "as-child": "" }, {
                        default: withCtx(() => [
                          createVNode("button", {
                            class: ["flex border items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer", [
                              mode.value === "exam-with-facit" ? "rounded-l-lg" : "rounded-r-lg",
                              unref(layoutMode) === mode.value ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                            ]],
                            onClick: ($event) => unref(setLayoutMode)(mode.value)
                          }, [
                            mode.icon === "split" ? (openBlock(), createBlock(_component_LucideColumns2, {
                              key: 0,
                              class: "w-5 h-5"
                            })) : (openBlock(), createBlock(_component_LucidePanelRight, {
                              key: 1,
                              class: "w-5 h-5"
                            }))
                          ], 10, ["onClick"])
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_TooltipContent, null, {
                        default: withCtx(() => [
                          createVNode("p", null, toDisplayString(mode.label), 1)
                        ]),
                        _: 2
                      }, 1024)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Tooltip, null, {
                  default: withCtx(() => [
                    createVNode(_component_TooltipTrigger, { "as-child": "" }, {
                      default: withCtx(() => [
                        createVNode("button", {
                          class: ["flex border items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer", [
                            mode.value === "exam-with-facit" ? "rounded-l-lg" : "rounded-r-lg",
                            unref(layoutMode) === mode.value ? "bg-primary text-primary-foreground border-transparent" : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                          ]],
                          onClick: ($event) => unref(setLayoutMode)(mode.value)
                        }, [
                          mode.icon === "split" ? (openBlock(), createBlock(_component_LucideColumns2, {
                            key: 0,
                            class: "w-5 h-5"
                          })) : (openBlock(), createBlock(_component_LucidePanelRight, {
                            key: 1,
                            class: "w-5 h-5"
                          }))
                        ], 10, ["onClick"])
                      ]),
                      _: 2
                    }, 1024),
                    createVNode(_component_TooltipContent, null, {
                      default: withCtx(() => [
                        createVNode("p", null, toDisplayString(mode.label), 1)
                      ]),
                      _: 2
                    }, 1024)
                  ]),
                  _: 2
                }, 1024)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LayoutSwitcher.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_10 = Object.assign(_sfc_main$1, { __name: "LayoutSwitcher" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[examId]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { layoutMode } = useLayoutMode();
    const chatStore = useChatStore();
    const examId = computed(() => route.params.examId);
    const courseCode = computed(() => route.params.courseCode);
    const { data: examData, status } = useFetch(
      () => `/api/exams/detail/${examId.value}`,
      "$EpvnbRpcOd"
      /* nuxt-injected */
    );
    const { data: courseData } = useFetch(
      () => `/api/exams/${courseCode.value}`,
      "$bUs0JC3sAf"
      /* nuxt-injected */
    );
    const exams = computed(() => courseData.value?.data?.exams ?? []);
    const exam = computed(() => examData.value?.data?.exam);
    const solution = computed(() => examData.value?.data?.solution);
    const solutionPdfUrl = computed(() => solution.value?.pdf_url ?? null);
    const isLoading = computed(() => status.value === "pending");
    const isError = computed(
      () => status.value === "error" || !isLoading.value && !exam.value
    );
    watchEffect(() => {
      if (!exam.value) return;
      useSeoMeta({
        title: `${exam.value.course_code} - Tenta ${exam.value.exam_date}`,
        description: `Se tenta för ${exam.value.course_code} från ${exam.value.exam_date}`,
        robots: "noindex, nofollow"
      });
    });
    onBeforeRouteUpdate((to, from) => {
      if (to.params.examId !== from.params.examId) {
        chatStore.close();
        chatStore.clearChat();
      }
    });
    watch(
      () => route.params.examId,
      () => {
        chatStore.close();
        chatStore.clearChat();
      }
    );
    const solutionBlurred = ref(true);
    const splitPercent = ref(55);
    const isResizing = ref(false);
    function startResize() {
      isResizing.value = true;
      function onMouseMove(e) {
        const percent = e.clientX / (void 0).innerWidth * 100;
        splitPercent.value = Math.min(Math.max(percent, 20), 80);
      }
      function onMouseUp() {
        isResizing.value = false;
        (void 0).removeEventListener("mousemove", onMouseMove);
        (void 0).removeEventListener("mouseup", onMouseUp);
      }
      (void 0).addEventListener("mousemove", onMouseMove);
      (void 0).addEventListener("mouseup", onMouseUp);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ExamHeader = __nuxt_component_0$1;
      const _component_LucideLoader2 = LoaderCircle;
      const _component_Button = _sfc_main$2$1;
      const _component_ExamOnlyView = __nuxt_component_3;
      const _component_ClientOnly = __nuxt_component_4;
      const _component_ResizeHandle = __nuxt_component_5;
      const _component_LucideUpload = Upload;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_ChatWindow = __nuxt_component_8;
      const _component_MobilePdfView = __nuxt_component_9;
      const _component_LayoutSwitcher = __nuxt_component_10;
      _push(`<!--[-->`);
      if (unref(exam)) {
        _push(ssrRenderComponent(_component_ExamHeader, {
          exams: unref(exams),
          "exam-id": unref(examId),
          "course-code": unref(courseCode),
          "solution-pdf-url": unref(solutionPdfUrl)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex h-screen flex-col w-full overflow-hidden" data-v-c7ad5856>`);
      if (unref(isLoading)) {
        _push(`<div class="flex h-screen items-center justify-center flex-col gap-2" data-v-c7ad5856>`);
        _push(ssrRenderComponent(_component_LucideLoader2, { class: "w-8 h-8 animate-spin text-muted-foreground" }, null, _parent));
        _push(`<p class="text-sm text-muted-foreground" data-v-c7ad5856>Laddar tenta...</p></div>`);
      } else if (unref(isError)) {
        _push(`<div class="flex h-screen items-center justify-center flex-col gap-2" data-v-c7ad5856><p class="text-2xl text-foreground/80" data-v-c7ad5856>Något gick fel!</p><p class="text-sm text-muted-foreground" data-v-c7ad5856> Ibland fungerar det att bara ladda om sidan :) </p>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "secondary",
          onClick: ($event) => ("refreshNuxtData" in _ctx ? _ctx.refreshNuxtData : unref(refreshNuxtData))()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ladda om`);
            } else {
              return [
                createTextVNode("Ladda om")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(exam)) {
        _push(`<!--[--><div class="${ssrRenderClass([{ "select-none": unref(isResizing) }, "flex-1 hidden lg:flex flex-row overflow-hidden"])}" data-v-c7ad5856>`);
        if (unref(layoutMode) === "exam-only") {
          _push(ssrRenderComponent(_component_ExamOnlyView, {
            "exam-pdf-url": unref(exam).pdf_url,
            "solution-pdf-url": unref(solutionPdfUrl)
          }, null, _parent));
        } else {
          _push(`<!--[--><div class="h-full overflow-hidden" style="${ssrRenderStyle({ width: `${unref(splitPercent)}%` })}" data-v-c7ad5856>`);
          _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
          _push(`</div><div class="relative w-0 shrink-0" data-v-c7ad5856>`);
          _push(ssrRenderComponent(_component_ResizeHandle, {
            "is-resizing": unref(isResizing),
            onStartResize: startResize
          }, null, _parent));
          _push(`</div><div class="relative h-full flex-1 min-w-0 overflow-hidden bg-background" data-v-c7ad5856><div class="absolute inset-0 z-0 h-full w-full flex flex-col" style="${ssrRenderStyle(!unref(chatStore).isOpen ? null : { display: "none" })}" data-v-c7ad5856>`);
          if (unref(solution)) {
            _push(`<div class="h-full relative" data-v-c7ad5856>`);
            _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
            if (unref(solutionBlurred)) {
              _push(`<div class="absolute inset-0 backdrop-blur-md bg-background/30 flex items-center justify-center pointer-events-none" data-v-c7ad5856><p class="text-sm text-muted-foreground" data-v-c7ad5856> Håll muspekaren för att visa facit </p></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<div class="flex h-full items-center justify-center p-6" data-v-c7ad5856><div class="group relative w-full max-w-sm" data-v-c7ad5856><div class="rounded-2xl border-2 border-dashed border-border/60 px-8 py-10 transition-colors group-hover:border-primary/30" data-v-c7ad5856><div class="flex flex-col items-center text-center gap-4" data-v-c7ad5856><div class="flex size-12 items-center justify-center rounded-2xl bg-muted/60 group-hover:bg-primary/10 transition-colors" data-v-c7ad5856>`);
            _push(ssrRenderComponent(_component_LucideUpload, { class: "size-6 text-muted-foreground group-hover:text-primary transition-colors" }, null, _parent));
            _push(`</div><div data-v-c7ad5856><p class="font-medium text-foreground/80" data-v-c7ad5856> Inget facit tillgängligt </p><p class="mt-1 text-xs text-muted-foreground/70 max-w-55 leading-relaxed" data-v-c7ad5856> Hjälp andra studenter genom att ladda upp facit till denna tenta. </p></div>`);
            _push(ssrRenderComponent(_component_NuxtLink, { to: "/upload-exams" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_Button, {
                    size: "sm",
                    variant: "outline"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(ssrRenderComponent(_component_LucideUpload, { class: "size-3.5" }, null, _parent3, _scopeId2));
                        _push3(` Ladda upp `);
                      } else {
                        return [
                          createVNode(_component_LucideUpload, { class: "size-3.5" }),
                          createTextVNode(" Ladda upp ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_Button, {
                      size: "sm",
                      variant: "outline"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_LucideUpload, { class: "size-3.5" }),
                        createTextVNode(" Ladda upp ")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div></div></div></div>`);
          }
          _push(`</div>`);
          if (unref(chatStore).isOpen) {
            _push(ssrRenderComponent(_component_ChatWindow, {
              key: "chat",
              "exam-id": unref(examId),
              "exam-url": unref(exam).pdf_url,
              "course-code": unref(courseCode),
              "solution-url": unref(solutionPdfUrl),
              "has-solution": !!unref(solution),
              class: "absolute inset-0 z-10 h-full w-full bg-background",
              onClose: ($event) => unref(chatStore).close()
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--]-->`);
        }
        _push(`</div>`);
        if (unref(exam)) {
          _push(ssrRenderComponent(_component_MobilePdfView, {
            "exam-pdf-url": unref(exam).pdf_url,
            "solution-pdf-url": unref(solutionPdfUrl),
            "course-code": unref(courseCode),
            "exam-date": unref(exam).exam_date
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_LayoutSwitcher, null, null, _parent));
      _push(`</div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search/[courseCode]/[examId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _examId_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c7ad5856"]]);

export { _examId_ as default };
//# sourceMappingURL=_examId_-DSgQDGpx.mjs.map
