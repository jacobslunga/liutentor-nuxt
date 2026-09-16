export default defineAppConfig({
  ui: {
    colors: { primary: "emerald", neutral: "neutral" },
    button: {
      slots: {
        base: "rounded-full font-bold",
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
      slots: {
        list: "!p-0 !gap-0 !rounded-full border-0 !bg-neutral-50 dark:!bg-elevated",
        indicator:
          "!inset-y-0 !rounded-full transition-[translate,width] duration-200 ease-out motion-reduce:transition-none !bg-white dark:!bg-default border border-neutral-200 dark:border-neutral-700 !shadow-[0_1px_4px_rgb(0_0_0/0.08)] dark:!shadow-[0_2px_6px_rgb(0_0_0/0.35)] ring-0",
        trigger:
          "!rounded-full !font-normal min-h-9 data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted transition-colors hover:text-highlighted",
      },
    },
  },
});
