export default defineAppConfig({
  ui: {
    colors: { primary: "emerald", neutral: "neutral" },
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
        list: "!p-0 !gap-0 overflow-hidden rounded-md border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900",
        indicator:
          "!inset-y-0 !rounded-md transition-[translate,width] duration-200 ease-out motion-reduce:transition-none !bg-neutral-200 dark:!bg-neutral-800 !text-highlighted shadow-none ring-0",
        trigger:
          "rounded-md data-[state=active]:!text-highlighted data-[state=inactive]:!bg-transparent text-muted transition-colors hover:text-highlighted",
      },
    },
  },
});
