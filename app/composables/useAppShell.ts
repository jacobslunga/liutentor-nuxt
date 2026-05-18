const AUTH_ROUTES = ["/logga-in", "/skapa-konto"];

interface AppShellState {
  hideFooter: ComputedRef<boolean>;
  isExamMode: Ref<boolean>;
}

function isExamRoute(path: string) {
  return /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(path);
}

function isQuizRoute(path: string) {
  return /^\/quiz\/[^/]+$/.test(path);
}

function isLockInRoute(path: string) {
  return /^\/lock-in\/[^/]+$/.test(path);
}

export function useDefaultAppShell(): AppShellState {
  const route = useRoute();
  const router = useRouter();
  const user = useSupabaseUser();
  const { initializeExamMode, updateActivity, cleanupHistory } =
    useLockInMode();

  const hideFooter = computed(
    () => isExamRoute(route.path) || isQuizRoute(route.path),
  );
  const isExamMode = ref(false);

  watch(
    user,
    (u) => {
      if (u && AUTH_ROUTES.includes(route.path)) {
        router.replace("/");
      }
    },
    { immediate: true },
  );

  function syncExamMode() {
    if (!import.meta.client) return;

    const session = initializeExamMode();
    if (session) {
      if (!isLockInRoute(route.path)) {
        router.replace(`/lock-in/${session.examId}`);
        return;
      }
      isExamMode.value = true;
    } else {
      if (isLockInRoute(route.path)) {
        router.replace("/");
        return;
      }
      isExamMode.value = false;
    }
    cleanupHistory();
  }

  onMounted(() => {
    syncExamMode();

    const onVisibility = () => {
      if (!document.hidden) syncExamMode();
    };
    const onFocus = () => syncExamMode();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "examMode") syncExamMode();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    onUnmounted(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    });
  });

  let cleanupActivityListeners: (() => void) | null = null;

  watch(isExamMode, (active) => {
    cleanupActivityListeners?.();
    cleanupActivityListeners = null;

    if (!active || !import.meta.client) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    const handler = () => updateActivity();
    events.forEach((event) =>
      document.addEventListener(event, handler, { passive: true }),
    );
    cleanupActivityListeners = () => {
      events.forEach((event) => document.removeEventListener(event, handler));
    };
  });

  onUnmounted(() => {
    cleanupActivityListeners?.();
  });

  watch(() => route.path, syncExamMode);

  return {
    hideFooter,
    isExamMode,
  };
}
