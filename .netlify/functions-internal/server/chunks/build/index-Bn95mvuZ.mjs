import { c as createLucideIcon } from './createLucideIcon-DZ6770Kf.mjs';
import { C as CircleCheck, L as Lightbulb } from './lightbulb-BamvPcHz.mjs';
import { L as LoaderCircle } from './loader-circle-CyCLhslC.mjs';
import { U as Upload } from './upload-BFP_z3M6.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BhLqGJzv.mjs';
import { b as useRoute, e as useFetch, f as useSeoMeta, a as _sfc_main$2 } from './server.mjs';
import { _ as _sfc_main$9, a as _sfc_main$3, b as _sfc_main$6, c as _sfc_main$3$1, d as _sfc_main$1$1, e as _sfc_main$5, f as _sfc_main$8 } from './DialogTrigger-zc1GJJHL.mjs';
import { defineComponent, computed, watchEffect, ref, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
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
import './x-PSThSuOQ.mjs';
import '@vueuse/core';

const __iconNode$4 = [
  ["path", { d: "m3 16 4 4 4-4", key: "1co6wj" }],
  ["path", { d: "M7 20V4", key: "1yoxec" }],
  ["path", { d: "M11 4h10", key: "1w87gc" }],
  ["path", { d: "M11 8h7", key: "djye34" }],
  ["path", { d: "M11 12h4", key: "q8tih4" }]
];
const ArrowDownWideNarrow = createLucideIcon("arrow-down-wide-narrow", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }],
  ["path", { d: "M11 12h10", key: "1438ji" }],
  ["path", { d: "M11 16h7", key: "uosisv" }],
  ["path", { d: "M11 20h4", key: "1krc32" }]
];
const ArrowUpWideNarrow = createLucideIcon("arrow-up-wide-narrow", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
      key: "pzmjnu"
    }
  ],
  ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]
];
const ChartPie = createLucideIcon("chart-pie", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$1);
const __iconNode = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ExamStatsDialog",
  __ssrInlineRender: true,
  props: {
    statistics: {},
    date: {},
    passRate: {}
  },
  setup(__props) {
    const props = __props;
    const gradeOrder = ["3", "4", "5", "G", "VG", "U"];
    const gradeColors = {
      "3": "var(--chart-3)",
      "4": "var(--chart-4)",
      "5": "var(--chart-5)",
      "G": "var(--chart-2)",
      "VG": "var(--chart-1)",
      "U": "var(--chart-1)"
    };
    const total = computed(
      () => Object.values(props.statistics).reduce((a, b) => a + b, 0)
    );
    const chartData = computed(
      () => gradeOrder.filter((g) => (props.statistics[g] ?? 0) > 0).map((grade) => ({
        grade,
        count: props.statistics[grade] ?? 0,
        color: gradeColors[grade] ?? "var(--chart-3)"
      }))
    );
    const maxCount = computed(
      () => Math.max(...chartData.value.map((d) => d.count))
    );
    function passColor(rate) {
      if (rate >= 50) return "text-green-500";
      if (rate >= 30) return "text-amber-500";
      return "text-red-500";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Dialog = _sfc_main$9;
      const _component_DialogTrigger = _sfc_main$3;
      const _component_DialogContent = _sfc_main$6;
      const _component_DialogHeader = _sfc_main$3$1;
      const _component_DialogTitle = _sfc_main$1$1;
      const _component_DialogDescription = _sfc_main$5;
      const _component_DialogClose = _sfc_main$8;
      _push(ssrRenderComponent(_component_Dialog, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_DialogTrigger, {
              class: ["font-mono text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-foreground/5 transition-colors duration-150", passColor(__props.passRate)],
              onClick: () => {
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(__props.passRate.toFixed(1))}% `);
                } else {
                  return [
                    createTextVNode(toDisplayString(__props.passRate.toFixed(1)) + "% ", 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_DialogContent, {
              class: "w-full max-w-sm",
              onClick: () => {
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_DialogHeader, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_DialogTitle, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Tentastatistik`);
                            } else {
                              return [
                                createTextVNode("Tentastatistik")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_DialogDescription, null, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`Betygsfördelning ${ssrInterpolate(__props.date)}`);
                            } else {
                              return [
                                createTextVNode("Betygsfördelning " + toDisplayString(__props.date), 1)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_DialogTitle, null, {
                            default: withCtx(() => [
                              createTextVNode("Tentastatistik")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_DialogDescription, null, {
                            default: withCtx(() => [
                              createTextVNode("Betygsfördelning " + toDisplayString(__props.date), 1)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(total) > 0) {
                    _push3(`<div class="flex flex-col gap-4"${_scopeId2}><div class="flex items-center justify-between text-sm"${_scopeId2}><span class="text-muted-foreground"${_scopeId2}>${ssrInterpolate(unref(total))} studenter</span><span class="${ssrRenderClass([passColor(__props.passRate), "font-mono"])}"${_scopeId2}>${ssrInterpolate(__props.passRate)}% godkänt </span></div><div class="border border-border rounded-lg p-3"${_scopeId2}><div class="flex items-end gap-2 h-32"${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(chartData), ({ grade, count, color }) => {
                      _push3(`<div class="flex-1 flex flex-col items-center gap-1"${_scopeId2}><span class="text-[10px] text-muted-foreground"${_scopeId2}>${ssrInterpolate(count)}</span><div class="w-full rounded-t-sm" style="${ssrRenderStyle({
                        height: `${count / unref(maxCount) * 88}px`,
                        backgroundColor: color
                      })}"${_scopeId2}></div><span class="text-[11px] text-muted-foreground"${_scopeId2}>${ssrInterpolate(grade)}</span></div>`);
                    });
                    _push3(`<!--]--></div></div><div class="space-y-2"${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(chartData), ({ grade, count, color }) => {
                      _push3(`<div class="flex items-center justify-between text-sm"${_scopeId2}><div class="flex items-center gap-2"${_scopeId2}><div class="w-2 h-2 rounded-sm" style="${ssrRenderStyle({ backgroundColor: color })}"${_scopeId2}></div><span class="text-foreground"${_scopeId2}>Betyg ${ssrInterpolate(grade)}</span></div><span class="text-muted-foreground"${_scopeId2}>${ssrInterpolate(count)} (${ssrInterpolate((count / unref(total) * 100).toFixed(1))}%) </span></div>`);
                    });
                    _push3(`<!--]--></div></div>`);
                  } else {
                    _push3(`<div class="py-6 text-center"${_scopeId2}><p class="text-sm text-muted-foreground"${_scopeId2}> Ingen statistik tillgänglig. </p></div>`);
                  }
                  _push3(`<div class="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground"${_scopeId2}><span${_scopeId2}> Data från <a href="https://ysektionen.se/student/tentastatistik/" target="_blank" class="text-primary hover:underline"${_scopeId2}> Y-Sektionen </a></span>`);
                  _push3(ssrRenderComponent(_component_DialogClose, { class: "hover:text-foreground transition-colors cursor-pointer" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(` Stäng `);
                      } else {
                        return [
                          createTextVNode(" Stäng ")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode(_component_DialogHeader, null, {
                      default: withCtx(() => [
                        createVNode(_component_DialogTitle, null, {
                          default: withCtx(() => [
                            createTextVNode("Tentastatistik")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_DialogDescription, null, {
                          default: withCtx(() => [
                            createTextVNode("Betygsfördelning " + toDisplayString(__props.date), 1)
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    unref(total) > 0 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex flex-col gap-4"
                    }, [
                      createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                        createVNode("span", { class: "text-muted-foreground" }, toDisplayString(unref(total)) + " studenter", 1),
                        createVNode("span", {
                          class: ["font-mono", passColor(__props.passRate)]
                        }, toDisplayString(__props.passRate) + "% godkänt ", 3)
                      ]),
                      createVNode("div", { class: "border border-border rounded-lg p-3" }, [
                        createVNode("div", { class: "flex items-end gap-2 h-32" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(chartData), ({ grade, count, color }) => {
                            return openBlock(), createBlock("div", {
                              key: grade,
                              class: "flex-1 flex flex-col items-center gap-1"
                            }, [
                              createVNode("span", { class: "text-[10px] text-muted-foreground" }, toDisplayString(count), 1),
                              createVNode("div", {
                                class: "w-full rounded-t-sm",
                                style: {
                                  height: `${count / unref(maxCount) * 88}px`,
                                  backgroundColor: color
                                }
                              }, null, 4),
                              createVNode("span", { class: "text-[11px] text-muted-foreground" }, toDisplayString(grade), 1)
                            ]);
                          }), 128))
                        ])
                      ]),
                      createVNode("div", { class: "space-y-2" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(chartData), ({ grade, count, color }) => {
                          return openBlock(), createBlock("div", {
                            key: grade,
                            class: "flex items-center justify-between text-sm"
                          }, [
                            createVNode("div", { class: "flex items-center gap-2" }, [
                              createVNode("div", {
                                class: "w-2 h-2 rounded-sm",
                                style: { backgroundColor: color }
                              }, null, 4),
                              createVNode("span", { class: "text-foreground" }, "Betyg " + toDisplayString(grade), 1)
                            ]),
                            createVNode("span", { class: "text-muted-foreground" }, toDisplayString(count) + " (" + toDisplayString((count / unref(total) * 100).toFixed(1)) + "%) ", 1)
                          ]);
                        }), 128))
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "py-6 text-center"
                    }, [
                      createVNode("p", { class: "text-sm text-muted-foreground" }, " Ingen statistik tillgänglig. ")
                    ])),
                    createVNode("div", { class: "flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground" }, [
                      createVNode("span", null, [
                        createTextVNode(" Data från "),
                        createVNode("a", {
                          href: "https://ysektionen.se/student/tentastatistik/",
                          target: "_blank",
                          class: "text-primary hover:underline"
                        }, " Y-Sektionen ")
                      ]),
                      createVNode(_component_DialogClose, { class: "hover:text-foreground transition-colors cursor-pointer" }, {
                        default: withCtx(() => [
                          createTextVNode(" Stäng ")
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_DialogTrigger, {
                class: ["font-mono text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-foreground/5 transition-colors duration-150", passColor(__props.passRate)],
                onClick: withModifiers(() => {
                }, ["prevent", "stop"])
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(__props.passRate.toFixed(1)) + "% ", 1)
                ]),
                _: 1
              }, 8, ["class", "onClick"]),
              createVNode(_component_DialogContent, {
                class: "w-full max-w-sm",
                onClick: withModifiers(() => {
                }, ["stop"])
              }, {
                default: withCtx(() => [
                  createVNode(_component_DialogHeader, null, {
                    default: withCtx(() => [
                      createVNode(_component_DialogTitle, null, {
                        default: withCtx(() => [
                          createTextVNode("Tentastatistik")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_DialogDescription, null, {
                        default: withCtx(() => [
                          createTextVNode("Betygsfördelning " + toDisplayString(__props.date), 1)
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  unref(total) > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex flex-col gap-4"
                  }, [
                    createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                      createVNode("span", { class: "text-muted-foreground" }, toDisplayString(unref(total)) + " studenter", 1),
                      createVNode("span", {
                        class: ["font-mono", passColor(__props.passRate)]
                      }, toDisplayString(__props.passRate) + "% godkänt ", 3)
                    ]),
                    createVNode("div", { class: "border border-border rounded-lg p-3" }, [
                      createVNode("div", { class: "flex items-end gap-2 h-32" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(chartData), ({ grade, count, color }) => {
                          return openBlock(), createBlock("div", {
                            key: grade,
                            class: "flex-1 flex flex-col items-center gap-1"
                          }, [
                            createVNode("span", { class: "text-[10px] text-muted-foreground" }, toDisplayString(count), 1),
                            createVNode("div", {
                              class: "w-full rounded-t-sm",
                              style: {
                                height: `${count / unref(maxCount) * 88}px`,
                                backgroundColor: color
                              }
                            }, null, 4),
                            createVNode("span", { class: "text-[11px] text-muted-foreground" }, toDisplayString(grade), 1)
                          ]);
                        }), 128))
                      ])
                    ]),
                    createVNode("div", { class: "space-y-2" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(chartData), ({ grade, count, color }) => {
                        return openBlock(), createBlock("div", {
                          key: grade,
                          class: "flex items-center justify-between text-sm"
                        }, [
                          createVNode("div", { class: "flex items-center gap-2" }, [
                            createVNode("div", {
                              class: "w-2 h-2 rounded-sm",
                              style: { backgroundColor: color }
                            }, null, 4),
                            createVNode("span", { class: "text-foreground" }, "Betyg " + toDisplayString(grade), 1)
                          ]),
                          createVNode("span", { class: "text-muted-foreground" }, toDisplayString(count) + " (" + toDisplayString((count / unref(total) * 100).toFixed(1)) + "%) ", 1)
                        ]);
                      }), 128))
                    ])
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "py-6 text-center"
                  }, [
                    createVNode("p", { class: "text-sm text-muted-foreground" }, " Ingen statistik tillgänglig. ")
                  ])),
                  createVNode("div", { class: "flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground" }, [
                    createVNode("span", null, [
                      createTextVNode(" Data från "),
                      createVNode("a", {
                        href: "https://ysektionen.se/student/tentastatistik/",
                        target: "_blank",
                        class: "text-primary hover:underline"
                      }, " Y-Sektionen ")
                    ]),
                    createVNode(_component_DialogClose, { class: "hover:text-foreground transition-colors cursor-pointer" }, {
                      default: withCtx(() => [
                        createTextVNode(" Stäng ")
                      ]),
                      _: 1
                    })
                  ])
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExamStatsDialog.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$1, { __name: "ExamStatsDialog" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const courseCode = route.params.courseCode;
    const { data, status } = useFetch(
      `/api/exams/${courseCode}`,
      "$aXHGMnBCPa"
      /* nuxt-injected */
    );
    const courseData = computed(() => data.value?.data);
    const exams = computed(() => courseData.value?.exams ?? []);
    watchEffect(() => {
      if (courseData.value) {
        useSeoMeta({
          title: `${courseCode} - ${courseData.value.courseName}`,
          description: `Plugga ${exams.value.length} tentor för ${courseCode} - ${courseData.value.courseName}`
        });
        return;
      }
      if (status.value === "success") {
        useSeoMeta({
          title: `${courseCode} - Inga tentor hittades`,
          description: `Inga tentor hittades för ${courseCode}. Var den första att ladda upp tentor.`
        });
      }
    });
    const sortOrder = ref("desc");
    const activeFilters = ref(/* @__PURE__ */ new Set());
    const prefixes = computed(() => {
      const all = exams.value.map((e) => e.exam_name.split(" ")[0]);
      return [...new Set(all)];
    });
    const sortedExams = computed(() => {
      return [...exams.value].sort((a, b) => {
        const diff = new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime();
        return sortOrder.value === "desc" ? diff : -diff;
      });
    });
    const filteredExams = computed(() => {
      if (activeFilters.value.size === 0) return sortedExams.value;
      return sortedExams.value.filter(
        (e) => activeFilters.value.has(e.exam_name.split(" ")[0] ?? "")
      );
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LucideLoader2 = LoaderCircle;
      const _component_LucideInbox = Inbox;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Button = _sfc_main$2;
      const _component_LucideUpload = Upload;
      const _component_LucideArrowDownWideNarrow = ArrowDownWideNarrow;
      const _component_LucideArrowUpWideNarrow = ArrowUpWideNarrow;
      const _component_LucideCircleCheck = CircleCheck;
      const _component_LucideCircleX = CircleX;
      const _component_ExamStatsDialog = __nuxt_component_9;
      const _component_LucideChartPie = ChartPie;
      const _component_LucideLightbulb = Lightbulb;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 max-w-4xl" }, _attrs))}>`);
      if (unref(status) === "pending") {
        _push(`<div class="flex items-center justify-center min-h-[60vh]">`);
        _push(ssrRenderComponent(_component_LucideLoader2, { class: "w-6 h-6 animate-spin text-muted-foreground" }, null, _parent));
        _push(`</div>`);
      } else if (unref(status) === "success" && !unref(courseData)) {
        _push(`<div class="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">`);
        _push(ssrRenderComponent(_component_LucideInbox, { class: "w-10 h-10 text-muted-foreground" }, null, _parent));
        _push(`<div><p class="text-sm font-medium text-foreground">Inga tentor hittades</p><p class="text-xs text-muted-foreground mt-1"> Var den första att ladda upp tentor för ${ssrInterpolate(unref(courseCode))}! </p></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/upload-exams" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Button, {
                variant: "default",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_LucideUpload, { class: "w-4 h-4" }, null, _parent3, _scopeId2));
                    _push3(` Ladda upp tenta `);
                  } else {
                    return [
                      createVNode(_component_LucideUpload, { class: "w-4 h-4" }),
                      createTextVNode(" Ladda upp tenta ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Button, {
                  variant: "default",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LucideUpload, { class: "w-4 h-4" }),
                    createTextVNode(" Ladda upp tenta ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(courseData)) {
        _push(`<!--[--><div class="flex justify-center"><div class="flex flex-col items-start w-full max-w-2xl"><div class="mb-6 w-full"><div class="text-xs text-muted-foreground font-mono mb-1">${ssrInterpolate(unref(courseCode))} / Tentor </div><h1 class="text-2xl font-semibold text-foreground whitespace-normal wrap-break-word leading-tight w-full">${ssrInterpolate(unref(courseData).courseName)}</h1><p class="text-sm text-muted-foreground mt-1">${ssrInterpolate(unref(exams).length)} tentor </p></div>`);
        if (unref(prefixes).length > 1) {
          _push(`<div class="flex flex-wrap gap-2 mb-4 w-full"><!--[-->`);
          ssrRenderList(unref(prefixes), (p) => {
            _push(`<button class="${ssrRenderClass([
              unref(activeFilters).has(p) ? "bg-foreground text-background border-foreground" : "border-dashed border-border text-muted-foreground hover:text-foreground",
              "text-xs cursor-pointer font-mono px-3 py-1 rounded-md border transition-colors"
            ])}">${ssrInterpolate(p)}</button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="w-full overflow-x-auto rounded-xl"><div class="min-w-fit w-full border border-border/50 rounded-xl overflow-hidden"><div class="grid grid-cols-[1fr_80px_64px_72px] px-4 py-2 border-b border-border/30 bg-muted/40"><div class="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"> Tentamen `);
        if (unref(sortOrder) === "asc") {
          _push(ssrRenderComponent(_component_LucideArrowDownWideNarrow, { class: "w-3.5 h-3.5" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(sortOrder) === "desc") {
          _push(ssrRenderComponent(_component_LucideArrowUpWideNarrow, { class: "w-3.5 h-3.5" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="text-xs text-muted-foreground">Typ</div><div class="text-xs text-muted-foreground text-center"> Facit </div><div class="text-xs text-muted-foreground text-right"> Godkänd </div></div><!--[-->`);
        ssrRenderList(unref(filteredExams), (exam) => {
          _push(`<div class="grid grid-cols-[1fr_80px_64px_72px] cursor-pointer px-4 py-3 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors items-center"><div><div class="text-sm font-medium text-foreground">${ssrInterpolate(exam.exam_name)}</div><div class="text-xs font-mono text-muted-foreground mt-0.5">${ssrInterpolate(exam.exam_date)}</div></div><div><span class="text-[10px] font-mono px-2 py-0.5 rounded border border-dashed border-border text-muted-foreground">${ssrInterpolate(exam.exam_name.split(" ")[0])}</span></div><div class="flex justify-center">`);
          if (exam.has_solution) {
            _push(ssrRenderComponent(_component_LucideCircleCheck, { class: "w-4 h-4 text-green-600 dark:text-green-400" }, null, _parent));
          } else {
            _push(ssrRenderComponent(_component_LucideCircleX, { class: "w-4 h-4 text-muted-foreground" }, null, _parent));
          }
          _push(`</div><div class="text-right flex flex-col items-end gap-1">`);
          _push(ssrRenderComponent(_component_ExamStatsDialog, {
            statistics: exam.statistics,
            date: exam.exam_date,
            "pass-rate": exam.pass_rate
          }, null, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div></div></div><div class="sticky bottom-0 z-50 pointer-events-none"><div class="bg-linear-to-t from-background via-background/80 to-transparent pt-8 pb-10"><div class="flex items-center justify-center gap-2 pointer-events-auto">`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/upload-exams" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Button, {
                variant: "default",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_LucideUpload, { class: "w-4.5 h-4.5" }, null, _parent3, _scopeId2));
                    _push3(` Ladda upp `);
                  } else {
                    return [
                      createVNode(_component_LucideUpload, { class: "w-4.5 h-4.5" }),
                      createTextVNode(" Ladda upp ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Button, {
                  variant: "default",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LucideUpload, { class: "w-4.5 h-4.5" }),
                    createTextVNode(" Ladda upp ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/search/${unref(courseCode)}/stats`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Button, {
                variant: "outline",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_LucideChartPie, { class: "w-4.5 h-4.5" }, null, _parent3, _scopeId2));
                    _push3(` Statistik `);
                  } else {
                    return [
                      createVNode(_component_LucideChartPie, { class: "w-4.5 h-4.5" }),
                      createTextVNode(" Statistik ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Button, {
                  variant: "outline",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LucideChartPie, { class: "w-4.5 h-4.5" }),
                    createTextVNode(" Statistik ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/quiz/${unref(courseCode)}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Button, {
                variant: "outline",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_LucideLightbulb, { class: "w-4.5 h-4.5 text-yellow-500" }, null, _parent3, _scopeId2));
                    _push3(` Quiz `);
                  } else {
                    return [
                      createVNode(_component_LucideLightbulb, { class: "w-4.5 h-4.5 text-yellow-500" }),
                      createTextVNode(" Quiz ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_Button, {
                  variant: "outline",
                  size: "sm"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_LucideLightbulb, { class: "w-4.5 h-4.5 text-yellow-500" }),
                    createTextVNode(" Quiz ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search/[courseCode]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bn95mvuZ.mjs.map
