export default defineAppConfig({
  ui: {
    colors: { primary: "emerald", secondary: "neutral", neutral: "neutral" },
    icons: {
      arrowDown: "i-openai-arrow-down",
      arrowLeft: "i-openai-arrow-left",
      arrowRight: "i-openai-arrow-right",
      arrowUp: "i-openai-arrow-up",
      caution: "i-openai-alert-circle",
      check: "i-openai-check",
      chevronDoubleLeft: "i-openai-chevrons-left",
      chevronDoubleRight: "i-openai-chevrons-right",
      chevronDown: "i-openai-chevron-down",
      chevronLeft: "i-openai-chevron-left",
      chevronRight: "i-openai-chevron-right",
      chevronUp: "i-openai-chevron-up",
      close: "i-openai-x",
      copy: "i-openai-copy",
      copyCheck: "i-openai-circle-check",
      dark: "i-openai-moon",
      drag: "i-openai-grip-vertical",
      ellipsis: "i-openai-dots",
      error: "i-openai-x",
      external: "i-openai-arrow-up-right",
      eye: "i-openai-eye",
      eyeOff: "i-openai-eye-off",
      file: "i-openai-file",
      folder: "i-openai-folder",
      folderOpen: "i-openai-folder-open",
      hash: "i-openai-hash",
      info: "i-openai-info-circle",
      light: "i-openai-sun",
      loading: "i-openai-spinner",
      menu: "i-openai-menu-2",
      minus: "i-openai-minus",
      panelClose: "i-lucide-panel-left-close",
      panelOpen: "i-lucide-panel-left-open",
      plus: "i-openai-plus",
      reload: "i-openai-rotate-clockwise",
      search: "i-openai-search",
      stop: "i-openai-player-stop",
      star: "i-openai-star",
      success: "i-openai-circle-check",
      system: "i-openai-device-desktop",
      tip: "i-openai-bulb",
      upload: "i-openai-upload",
      warning: "i-openai-alert-triangle",
    },
    button: {
      slots: {
        base: "rounded-full font-medium",
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
          "h-auto rounded-full bg-neutral-900 text-white dark:bg-neutral-50 dark:text-black ring-0 px-2 py-1 text-xs font-semibold shadow-lg",
        arrow: "fill-neutral-900 stroke-neutral-900",
      },
    },
    chatPalette: {
      slots: {
        prompt: "border-t-0",
      },
    },
    input: { slots: { root: "rounded-xl", base: "rounded-xl" } },
    inputMenu: {
      slots: {
        base: "rounded-full",
        content: "rounded-[16px] shadow-lg",
        item: "rounded-[8px] before:rounded-[8px]",
      },
    },
    textarea: { slots: { base: "rounded-xl" } },
    select: {
      slots: {
        base: "rounded-xl",
        content: "rounded-[12px] shadow-lg",
        item: "rounded-[8px] before:rounded-[8px]",
      },
    },
    selectMenu: {
      slots: {
        base: "rounded-xl",
        content: "rounded-[12px] shadow-lg",
        item: "rounded-[8px] before:rounded-[8px]",
      },
    },
    popover: { slots: { content: "rounded-[12px] shadow-lg" } },
    alert: { slots: { root: "rounded-xl" } },
    card: { slots: { root: "rounded-2xl shadow-sm" } },
    modal: {
      slots: {
        footer: "justify-end",
      },
      variants: {
        fullscreen: {
          false: {
            content: "rounded-3xl shadow-xl",
          },
        },
      },
    },
    tabs: {
      slots: {
        list: "rounded-full",
        indicator: "rounded-full",
        trigger: "rounded-full",
      },
      variants: {
        variant: {
          pill: {
            list: "grid grid-flow-col auto-cols-fr p-0 w-auto rounded-full",
            trigger: "px-5 rounded-full before:rounded-full",
            indicator: "rounded-full shadow-sm",
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
    dropdownMenu: {
      slots: {
        content: "rounded-[12px] shadow-lg",
        item: "rounded-[8px] before:rounded-[8px]",
        itemLabel: "font-normal",
      },
    },
  },
});
