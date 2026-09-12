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
        list: "p-1 gap-0 bg-neutral-100 dark:bg-neutral-900 border-0 rounded-full",
        indicator:
          "transition-[translate,width] duration-200 ease-out motion-reduce:transition-none !bg-white dark:!bg-neutral-700 !text-highlighted shadow-[0_1px_4px_rgb(0_0_0/0.08)] ring-1 ring-black/5 dark:ring-white/10 rounded-full inset-y-1",
        trigger:
          "data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted hover:text-highlighted rounded-full transition-colors",
      },
      variants: {
        variant: {
          pill: {
            list: "bg-neutral-100 dark:bg-neutral-900 border-0 rounded-full",
            indicator:
              "!bg-white dark:!bg-neutral-700 !text-highlighted shadow-[0_1px_4px_rgb(0_0_0/0.08)] ring-1 ring-black/5 dark:ring-white/10 rounded-full",
            trigger:
              "data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted hover:text-highlighted rounded-full",
          },
        },
      },
      compoundVariants: [
        {
          color: "neutral",
          variant: "pill",
          class: {
            indicator:
              "!bg-white dark:!bg-neutral-700 shadow-[0_1px_4px_rgb(0_0_0/0.08)] ring-1 ring-black/5 dark:ring-white/10 rounded-full",
            trigger: [
              "data-[state=active]:!text-highlighted",
              "in-[[data-slot=list]:not(:has([data-slot=indicator]))]:data-[state=active]:before:!bg-white dark:in-[[data-slot=list]:not(:has([data-slot=indicator]))]:data-[state=active]:before:!bg-neutral-700",
            ],
          },
        },
      ],
    },
  },
});
