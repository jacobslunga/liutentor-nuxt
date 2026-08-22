/**
 * Makes the route transition itself one of the tracked tasks, so navigation and
 * page data share a single bar instead of each finishing on its own schedule.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { begin } = usePageLoading();
  let release: ReturnType<typeof begin> | null = null;

  nuxtApp.hook("page:loading:start", () => {
    release ??= begin();
  });

  nuxtApp.hook("page:loading:end", () => {
    release?.();
    release = null;
  });

  nuxtApp.hook("vue:error", () => {
    release?.({ error: true });
    release = null;
  });
});
