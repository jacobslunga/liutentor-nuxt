export default defineAppConfig({
  ui: {
    colors: { primary: "emerald", neutral: "neutral" },
    // Nuxt UI:s interna ikoner (select-pilar, stäng, laddning …) i Tabler.
    icons: {
      arrowDown: "i-tabler-arrow-down",
      arrowLeft: "i-tabler-arrow-left",
      arrowRight: "i-tabler-arrow-right",
      arrowUp: "i-tabler-arrow-up",
      caution: "i-tabler-alert-circle",
      check: "i-tabler-check",
      chevronDoubleLeft: "i-tabler-chevrons-left",
      chevronDoubleRight: "i-tabler-chevrons-right",
      chevronDown: "i-tabler-chevron-down",
      chevronLeft: "i-tabler-chevron-left",
      chevronRight: "i-tabler-chevron-right",
      chevronUp: "i-tabler-chevron-up",
      close: "i-tabler-x",
      copy: "i-tabler-copy",
      copyCheck: "i-tabler-circle-check",
      dark: "i-tabler-moon",
      drag: "i-tabler-grip-vertical",
      ellipsis: "i-tabler-dots",
      error: "i-tabler-x",
      external: "i-tabler-arrow-up-right",
      eye: "i-tabler-eye",
      eyeOff: "i-tabler-eye-off",
      file: "i-tabler-file",
      folder: "i-tabler-folder",
      folderOpen: "i-tabler-folder-open",
      hash: "i-tabler-hash",
      info: "i-tabler-info-circle",
      light: "i-tabler-sun",
      loading: "i-tabler-loader-2",
      menu: "i-tabler-menu-2",
      minus: "i-tabler-minus",
      panelClose: "i-tabler-layout-sidebar-left-collapse",
      panelOpen: "i-tabler-layout-sidebar-left-collapse",
      plus: "i-tabler-plus",
      reload: "i-tabler-rotate-clockwise",
      search: "i-tabler-search",
      stop: "i-tabler-player-stop",
      star: "i-tabler-star",
      success: "i-tabler-circle-check",
      system: "i-tabler-device-desktop",
      tip: "i-tabler-bulb",
      upload: "i-tabler-upload",
      warning: "i-tabler-alert-triangle",
    },
    button: {
      slots: {
        base: "2xl:font-semibold",
      },
      variants: {
        square: {
          true: "aspect-square justify-center gap-0",
        },
      },
    },
    chatPalette: {
      slots: {
        prompt: "border-t-0",
      },
    },
    modal: {
      slots: {
        footer: "justify-end",
      },
    },
    tabs: {
      compoundVariants: [
        {
          color: "neutral",
          variant: "pill",
          class: {
            indicator: "bg-default ring ring-default",
            trigger: "data-[state=active]:text-highlighted",
          },
        },
      ],
    },
    dropdownMenu: {
      slots: {
        itemLabel: "font-medium",
      },
    },
  },
});
