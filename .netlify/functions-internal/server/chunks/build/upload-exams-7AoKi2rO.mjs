import { C as CircleAlert } from './circle-alert-CYwTyQYA.mjs';
import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { L as LoaderCircle } from './loader-circle-CyCLhslC.mjs';
import { U as Upload } from './upload-BFP_z3M6.mjs';
import { X } from './x-PSThSuOQ.mjs';
import { f as useSeoMeta, a as _sfc_main$2$1, c as cn, g as buttonVariants } from './server.mjs';
import { defineComponent, ref, watch, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createTextVNode, toDisplayString, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { useForwardPropsEmits, AlertDialogRoot, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger } from 'reka-ui';
import { useDropZone, reactiveOmit } from '@vueuse/core';
import { c as courseCodes } from './courseCodes-CFN6Z9T3.mjs';
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

const __iconNode$2 = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode);
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialog",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    defaultOpen: { type: Boolean }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const forwarded = useForwardPropsEmits(props, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(AlertDialogRoot), mergeProps({ "data-slot": "alert-dialog" }, unref(forwarded), _attrs), {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialog.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogAction",
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
      _push(ssrRenderComponent(unref(AlertDialogAction), mergeProps(unref(delegatedProps), {
        class: unref(cn)(unref(buttonVariants)(), props.class)
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
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogAction.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogCancel",
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
      _push(ssrRenderComponent(unref(AlertDialogCancel), mergeProps(unref(delegatedProps), {
        class: unref(cn)(unref(buttonVariants)({ variant: "outline" }), "mt-2 sm:mt-0", props.class)
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
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogCancel.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "AlertDialogContent",
  __ssrInlineRender: true,
  props: {
    forceMount: { type: Boolean },
    disableOutsidePointerEvents: { type: Boolean },
    asChild: { type: Boolean },
    as: {},
    class: { type: [Boolean, null, String, Object, Array] }
  },
  emits: ["escapeKeyDown", "pointerDownOutside", "focusOutside", "interactOutside", "openAutoFocus", "closeAutoFocus"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const delegatedProps = reactiveOmit(props, "class");
    const forwarded = useForwardPropsEmits(delegatedProps, emits);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(AlertDialogPortal), _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(AlertDialogOverlay), {
              "data-slot": "alert-dialog-overlay",
              class: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(AlertDialogContent), mergeProps({ "data-slot": "alert-dialog-content" }, { ..._ctx.$attrs, ...unref(forwarded) }, {
              class: unref(cn)(
                "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                props.class
              )
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
              createVNode(unref(AlertDialogOverlay), {
                "data-slot": "alert-dialog-overlay",
                class: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
              }),
              createVNode(unref(AlertDialogContent), mergeProps({ "data-slot": "alert-dialog-content" }, { ..._ctx.$attrs, ...unref(forwarded) }, {
                class: unref(cn)(
                  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                  props.class
                )
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
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogContent.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogDescription",
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
      _push(ssrRenderComponent(unref(AlertDialogDescription), mergeProps({ "data-slot": "alert-dialog-description" }, unref(delegatedProps), {
        class: unref(cn)("text-muted-foreground text-sm", props.class)
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
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogDescription.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogFooter",
  __ssrInlineRender: true,
  props: {
    class: { type: [Boolean, null, String, Object, Array] }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        "data-slot": "alert-dialog-footer",
        class: unref(cn)("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", props.class)
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogFooter.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogHeader",
  __ssrInlineRender: true,
  props: {
    class: { type: [Boolean, null, String, Object, Array] }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        "data-slot": "alert-dialog-header",
        class: unref(cn)("flex flex-col gap-2 text-center sm:text-left", props.class)
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogHeader.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogTitle",
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
      _push(ssrRenderComponent(unref(AlertDialogTitle), mergeProps({ "data-slot": "alert-dialog-title" }, unref(delegatedProps), {
        class: unref(cn)("text-lg font-semibold", props.class)
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogTitle.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AlertDialogTrigger",
  __ssrInlineRender: true,
  props: {
    asChild: { type: Boolean },
    as: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(AlertDialogTrigger), mergeProps({ "data-slot": "alert-dialog-trigger" }, props, _attrs), {
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/alert-dialog/AlertDialogTrigger.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "upload-exams",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Ladda upp tenta",
      description: "Ladda upp gamla tentor och facit till LiU Tentor.",
      robots: "index, follow"
    });
    const kurskod = ref("");
    const files = ref([]);
    const loading = ref(false);
    const uploadStatus = ref(null);
    const errorMessage = ref("");
    const dropZoneRef = ref(null);
    const { isOverDropZone } = useDropZone(dropZoneRef, {
      onDrop: (droppedFiles) => {
        if (!droppedFiles) return;
        files.value = [
          ...files.value,
          ...Array.from(droppedFiles).filter((f) => f.type === "application/pdf")
        ];
      }
    });
    function removeFile(index) {
      files.value = files.value.filter((_, i) => i !== index);
    }
    function parseDateFromFilename(name) {
      const fullDateMatch = name.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
      if (fullDateMatch && fullDateMatch[1] && fullDateMatch[2] && fullDateMatch[3]) {
        const year = parseInt(fullDateMatch[1], 10);
        const month = parseInt(fullDateMatch[2], 10);
        const day = parseInt(fullDateMatch[3], 10);
        if (year > 1990 && year < 2050 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }
      const shortDateMatch = name.match(new RegExp("(?<!\\d)(\\d{2})(\\d{2})(\\d{2})(?!\\d)"));
      if (shortDateMatch && shortDateMatch[1] && shortDateMatch[2] && shortDateMatch[3]) {
        const year = parseInt(shortDateMatch[1], 10);
        const month = parseInt(shortDateMatch[2], 10);
        const day = parseInt(shortDateMatch[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${2e3 + year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }
      return null;
    }
    function isSolution(name) {
      const n = name.toLowerCase();
      const keywords = [
        "lösningsförslag",
        "facit",
        "solution",
        "losning",
        "sol",
        "lsn",
        "lösning",
        "tenlsg",
        "lf",
        "svar"
      ];
      if (n.includes("tenta_och_svar")) return false;
      return keywords.some((k) => n.includes(k));
    }
    async function handleUpload() {
      if (!files.value.length || !kurskod.value) return;
      loading.value = true;
      errorMessage.value = "";
      let successCount = 0;
      for (const file of files.value) {
        try {
          const examDate = parseDateFromFilename(file.name);
          if (!examDate)
            throw new Error(`Kunde inte hitta ett datum i filnamnet: ${file.name}`);
          const fileType = isSolution(file.name) ? "SOLUTION" : "EXAM";
          const normalizedFilename = `${kurskod.value.toUpperCase().trim()}_${examDate}_${fileType}.pdf`;
          await $fetch("/api/upload", {
            method: "POST",
            body: {
              courseCode: kurskod.value.toUpperCase().trim(),
              originalFilename: file.name,
              normalizedFilename,
              examDate,
              fileType
            }
          });
          successCount++;
        } catch (error) {
          errorMessage.value = error instanceof Error ? error.message : "Okänt fel";
          break;
        }
      }
      loading.value = false;
      uploadStatus.value = successCount > 0 && successCount === files.value.length ? "success" : "error";
      if (successCount > 0) {
        files.value = [];
        kurskod.value = "";
      }
    }
    const typed = ref("");
    const exIndex = ref(Math.floor(Math.random() * courseCodes.length));
    const charIndex = ref(0);
    const deleting = ref(false);
    let typingTimer = null;
    const shuffledExamples = [...courseCodes].sort(() => Math.random() - 0.5);
    function runTyping() {
      if (kurskod.value) return;
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
    watch(kurskod, (val) => {
      if (val && typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      } else if (!val && !typingTimer) runTyping();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideUpload = Upload;
      const _component_LucideFileText = FileText;
      const _component_Button = _sfc_main$2$1;
      const _component_LucideX = X;
      const _component_LucideLoader2 = LoaderCircle;
      const _component_LucideInfo = Info;
      const _component_AlertDialog = _sfc_main$9;
      const _component_AlertDialogContent = _sfc_main$6;
      const _component_AlertDialogHeader = _sfc_main$3;
      const _component_LucideCheckCircle = CircleCheckBig;
      const _component_LucideAlertCircle = CircleAlert;
      const _component_AlertDialogTitle = _sfc_main$2;
      const _component_AlertDialogDescription = _sfc_main$5;
      const _component_AlertDialogFooter = _sfc_main$4;
      const _component_AlertDialogAction = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full max-w-2xl" }, _attrs))}><h1 class="text-3xl font-semibold text-foreground mb-2">Ladda upp tenta</h1><p class="text-sm font-normal text-muted-foreground mb-8"> Hjälp andra studenter genom att ladda upp gamla tentor och facit. </p><div class="space-y-6"><div class="space-y-2"><label class="text-sm font-normal text-muted-foreground">Kurskod</label><input${ssrRenderAttr("value", unref(kurskod))}${ssrRenderAttr("placeholder", unref(kurskod) ? "" : unref(typed))}${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full bg-transparent font-normal outline-none border-0 border-b-2 border-foreground/20 text-center text-4xl focus:ring-0 focus:border-primary transition-colors p-2 placeholder:text-muted-foreground/40"></div><div class="${ssrRenderClass([
        unref(isOverDropZone) ? "border-primary bg-primary/5 scale-105" : "border-muted hover:border-primary/50",
        "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
      ])}" style="${ssrRenderStyle(unref(loading) ? "opacity: 0.5; pointer-events: none" : "")}"><input type="file" accept="application/pdf" multiple class="hidden"><div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">`);
      _push(ssrRenderComponent(_component_LucideUpload, { class: "h-8 w-8" }, null, _parent));
      _push(`<p class="font-normal"> Dra och släpp PDF-filer här, eller klicka för att välja </p></div></div>`);
      if (unref(files).length > 0) {
        _push(`<div class="space-y-3"><div class="space-y-2 rounded-md border p-2"><!--[-->`);
        ssrRenderList(unref(files), (file, index) => {
          _push(`<div class="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"><div class="flex items-center gap-2 overflow-hidden">`);
          _push(ssrRenderComponent(_component_LucideFileText, { class: "h-4 w-4 shrink-0 text-muted-foreground" }, null, _parent));
          _push(`<span class="truncate">${ssrInterpolate(file.name)}</span></div>`);
          _push(ssrRenderComponent(_component_Button, {
            variant: "ghost",
            size: "icon",
            class: "h-6 w-6",
            onClick: ($event) => removeFile(index)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_LucideX, { class: "h-4 w-4" }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_LucideX, { class: "h-4 w-4" })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_component_Button, {
          class: "w-full",
          size: "lg",
          disabled: !unref(kurskod) || unref(loading),
          onClick: handleUpload
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(loading)) {
                _push2(ssrRenderComponent(_component_LucideLoader2, { class: "h-5 w-5 animate-spin" }, null, _parent2, _scopeId));
              } else {
                _push2(`<span${_scopeId}>Ladda upp</span>`);
              }
            } else {
              return [
                unref(loading) ? (openBlock(), createBlock(_component_LucideLoader2, {
                  key: 0,
                  class: "h-5 w-5 animate-spin"
                })) : (openBlock(), createBlock("span", { key: 1 }, "Ladda upp"))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="p-4 bg-muted/50 border rounded-lg flex items-start gap-2 text-left">`);
      _push(ssrRenderComponent(_component_LucideInfo, { class: "h-4 w-4 text-muted-foreground shrink-0" }, null, _parent));
      _push(`<p class="text-xs text-muted-foreground"> Uppladdade tentor granskas innan de blir tillgängliga för andra studenter. </p></div></div>`);
      _push(ssrRenderComponent(_component_AlertDialog, {
        open: unref(uploadStatus) !== null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AlertDialogContent, null, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_AlertDialogHeader, { class: "text-center" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex justify-center mb-2"${_scopeId3}>`);
                        if (unref(uploadStatus) === "success") {
                          _push4(ssrRenderComponent(_component_LucideCheckCircle, { class: "h-12 w-12 text-green-500" }, null, _parent4, _scopeId3));
                        } else {
                          _push4(ssrRenderComponent(_component_LucideAlertCircle, { class: "h-12 w-12 text-red-500" }, null, _parent4, _scopeId3));
                        }
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(_component_AlertDialogTitle, { class: "text-xl" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(uploadStatus) === "success" ? "Uppladdning lyckades!" : "Något gick fel")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Uppladdning lyckades!" : "Något gick fel"), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_AlertDialogDescription, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(unref(uploadStatus) === "success" ? "Tack! Din tenta har laddats upp och granskas inom kort." : unref(errorMessage) || "Ett fel uppstod vid uppladdningen.")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Tack! Din tenta har laddats upp och granskas inom kort." : unref(errorMessage) || "Ett fel uppstod vid uppladdningen."), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode("div", { class: "flex justify-center mb-2" }, [
                            unref(uploadStatus) === "success" ? (openBlock(), createBlock(_component_LucideCheckCircle, {
                              key: 0,
                              class: "h-12 w-12 text-green-500"
                            })) : (openBlock(), createBlock(_component_LucideAlertCircle, {
                              key: 1,
                              class: "h-12 w-12 text-red-500"
                            }))
                          ]),
                          createVNode(_component_AlertDialogTitle, { class: "text-xl" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Uppladdning lyckades!" : "Något gick fel"), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_AlertDialogDescription, null, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Tack! Din tenta har laddats upp och granskas inom kort." : unref(errorMessage) || "Ett fel uppstod vid uppladdningen."), 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_AlertDialogFooter, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_AlertDialogAction, {
                          class: "w-full",
                          onClick: ($event) => uploadStatus.value = null
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` OK `);
                            } else {
                              return [
                                createTextVNode(" OK ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_AlertDialogAction, {
                            class: "w-full",
                            onClick: ($event) => uploadStatus.value = null
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" OK ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_AlertDialogHeader, { class: "text-center" }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "flex justify-center mb-2" }, [
                          unref(uploadStatus) === "success" ? (openBlock(), createBlock(_component_LucideCheckCircle, {
                            key: 0,
                            class: "h-12 w-12 text-green-500"
                          })) : (openBlock(), createBlock(_component_LucideAlertCircle, {
                            key: 1,
                            class: "h-12 w-12 text-red-500"
                          }))
                        ]),
                        createVNode(_component_AlertDialogTitle, { class: "text-xl" }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Uppladdning lyckades!" : "Något gick fel"), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_AlertDialogDescription, null, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Tack! Din tenta har laddats upp och granskas inom kort." : unref(errorMessage) || "Ett fel uppstod vid uppladdningen."), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(_component_AlertDialogFooter, null, {
                      default: withCtx(() => [
                        createVNode(_component_AlertDialogAction, {
                          class: "w-full",
                          onClick: ($event) => uploadStatus.value = null
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" OK ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
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
              createVNode(_component_AlertDialogContent, null, {
                default: withCtx(() => [
                  createVNode(_component_AlertDialogHeader, { class: "text-center" }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "flex justify-center mb-2" }, [
                        unref(uploadStatus) === "success" ? (openBlock(), createBlock(_component_LucideCheckCircle, {
                          key: 0,
                          class: "h-12 w-12 text-green-500"
                        })) : (openBlock(), createBlock(_component_LucideAlertCircle, {
                          key: 1,
                          class: "h-12 w-12 text-red-500"
                        }))
                      ]),
                      createVNode(_component_AlertDialogTitle, { class: "text-xl" }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Uppladdning lyckades!" : "Något gick fel"), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_AlertDialogDescription, null, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(uploadStatus) === "success" ? "Tack! Din tenta har laddats upp och granskas inom kort." : unref(errorMessage) || "Ett fel uppstod vid uppladdningen."), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  createVNode(_component_AlertDialogFooter, null, {
                    default: withCtx(() => [
                      createVNode(_component_AlertDialogAction, {
                        class: "w-full",
                        onClick: ($event) => uploadStatus.value = null
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" OK ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/upload-exams.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=upload-exams-7AoKi2rO.mjs.map
