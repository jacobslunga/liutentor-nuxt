/**
 * Makes the route transition itself one of the tracked tasks, so navigation and
 * page data share a single bar instead of each finishing on its own schedule.
 *
 * Nuxt fires `page:loading:start` for every router navigation, including ones
 * that only rewrite the query or hash — the tab state in `?tab=` is written back
 * with `router.replace`, which keeps the same page component mounted and fetches
 * nothing. We start the bar from our own guard instead, so only a real change of
 * page counts. `page:loading:end` still fires for those no-op navigations, but
 * releasing a task we never began is a no-op.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { begin } = usePageLoading();
  const router = useRouter();
  let release: ReturnType<typeof begin> | null = null;

  router.beforeEach((to, from) => {
    if (to.path === from.path) return;
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
