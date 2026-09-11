export default defineAppConfig({
  ui: {
    /* Enda avsteget från Nuxt UI:s standard: varumärkesfärgen. Nyanserna
       kommer från emerald, medan basvärdet sätts exakt i tailwind.css
       (`--ui-primary`) så tonen blir densamma som tidigare. */
    colors: { primary: "emerald", neutral: "neutral" },
    chatPalette: {
      slots: {
        prompt: "border-t-0",
      },
    },
    /* Alla modaler i appen är bekräftelsedialoger, så knappraden ligger nere
       till höger som i en klassisk alert dialog. */
    modal: {
      slots: {
        footer: "justify-end",
      },
    },
    tabs: {
      slots: {
        list: "p-0.5 gap-0.5 bg-neutral-200/60 dark:bg-neutral-900/90 border border-default/60 rounded-lg",
        indicator:
          "transition-[translate,width] duration-200 ease-out motion-reduce:transition-none !bg-default dark:!bg-neutral-700 !text-highlighted shadow-xs ring-1 ring-default/60 dark:ring-white/15 rounded-md inset-y-0.5",
        trigger:
          "data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted hover:text-highlighted rounded-sm transition-colors",
      },
      variants: {
        variant: {
          pill: {
            list: "bg-neutral-200/60 dark:bg-neutral-900/90 border border-default/60 rounded-lg",
            indicator:
              "!bg-default dark:!bg-neutral-700 !text-highlighted shadow-xs ring-1 ring-default/60 dark:ring-white/15 rounded-md",
            trigger:
              "data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted hover:text-highlighted",
          },
        },
      },
      compoundVariants: [
        {
          color: "neutral",
          variant: "pill",
          class: {
            indicator:
              "!bg-default dark:!bg-neutral-700 shadow-xs ring-1 ring-default/60 dark:ring-white/15",
            trigger: [
              "data-[state=active]:!text-highlighted",
              "in-[[data-slot=list]:not(:has([data-slot=indicator]))]:data-[state=active]:before:!bg-default dark:in-[[data-slot=list]:not(:has([data-slot=indicator]))]:data-[state=active]:before:!bg-neutral-700",
            ],
          },
        },
      ],
    },
  },
});
