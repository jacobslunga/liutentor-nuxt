export default defineAppConfig({
  ui: {
    colors: { primary: "emerald", secondary: "neutral", neutral: "neutral" },
    icons: {
      arrowDown: "i-lucide-arrow-down",
      arrowLeft: "i-lucide-arrow-left",
      arrowRight: "i-lucide-arrow-right",
      arrowUp: "i-lucide-arrow-up",
      caution: "i-lucide-circle-alert",
      check: "i-lucide-check",
      chevronDoubleLeft: "i-lucide-chevrons-left",
      chevronDoubleRight: "i-lucide-chevrons-right",
      chevronDown: "i-lucide-chevron-down",
      chevronLeft: "i-lucide-chevron-left",
      chevronRight: "i-lucide-chevron-right",
      chevronUp: "i-lucide-chevron-up",
      close: "i-lucide-x",
      copy: "i-lucide-copy",
      copyCheck: "i-lucide-circle-check",
      dark: "i-lucide-moon",
      drag: "i-lucide-grip-vertical",
      ellipsis: "i-lucide-ellipsis",
      error: "i-lucide-x",
      external: "i-lucide-arrow-up-right",
      eye: "i-lucide-eye",
      eyeOff: "i-lucide-eye-off",
      file: "i-lucide-file",
      folder: "i-lucide-folder",
      folderOpen: "i-lucide-folder-open",
      hash: "i-lucide-hash",
      info: "i-lucide-info",
      light: "i-lucide-sun",
      loading: "i-lucide-loader-circle",
      menu: "i-lucide-menu",
      minus: "i-lucide-minus",
      panelClose: "i-lucide-panel-left-close",
      panelOpen: "i-lucide-panel-left-open",
      plus: "i-lucide-plus",
      reload: "i-lucide-rotate-cw",
      search: "i-lucide-search",
      stop: "i-lucide-circle-stop",
      star: "i-lucide-star",
      success: "i-lucide-circle-check",
      system: "i-lucide-monitor",
      tip: "i-lucide-lightbulb",
      upload: "i-lucide-upload",
      warning: "i-lucide-triangle-alert",
    },
    button: {
      slots: {
        base: "font-semibold",
      },
      variants: {
        square: {
          true: "aspect-square justify-center gap-0",
        },
      },
    },
    tooltip: {
      slots: {
        content:
          "h-auto bg-neutral-900 text-white dark:bg-neutral-50 dark:text-black ring-0 px-2 py-1 text-xs font-semibold shadow-lg",
        arrow: "fill-neutral-900 stroke-neutral-900",
      },
    },
    tabs: {
      variants: {
        variant: {
          pill: {
            list: "grid grid-flow-col auto-cols-fr p-0 w-auto",
            trigger: "px-5",
            indicator: "shadow-sm",
          },
        },
      },
      compoundVariants: [
        {
          orientation: "horizontal",
          variant: "pill",
          class: { indicator: "inset-y-0" },
        },
        {
          orientation: "vertical",
          variant: "pill",
          class: { indicator: "inset-x-0" },
        },
        {
          color: "neutral",
          variant: "pill",
          class: {
            indicator:
              "bg-default ring-1 ring-inset ring-black/5 dark:ring-white/10 shadow-sm",
            trigger: "data-[state=active]:text-highlighted",
          },
        },
      ],
    },
  },
});
