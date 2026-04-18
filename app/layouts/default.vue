<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const user = useSupabaseUser();

const AUTH_ROUTES = ["/logga-in", "/skapa-konto"];

watch(
  user,
  (u) => {
    if (u && AUTH_ROUTES.includes(route.path)) {
      router.replace("/");
    }
  },
  { immediate: true },
);
const { initializeExamMode, updateActivity, cleanupHistory } = useLockInMode();

const hideFooter = computed(
  () =>
    /^\/search\/[A-Z0-9]+\/[0-9]+$/.test(route.path) ||
    /^\/quiz\/[^/]+$/.test(route.path),
);

const isLockInRoute = computed(() => /^\/lock-in\/[^/]+$/.test(route.path));

const isExamMode = ref(false);

function checkSession() {
  const session = initializeExamMode();
  if (session) {
    if (!isLockInRoute.value) {
      router.replace(`/lock-in/${session.examId}`);
      return;
    }
    isExamMode.value = true;
  } else {
    if (isLockInRoute.value) {
      router.replace("/");
      return;
    }
    isExamMode.value = false;
  }
  cleanupHistory();
}

onMounted(() => {
  checkSession();

  const onVisibility = () => {
    if (!document.hidden) checkSession();
  };
  const onFocus = () => checkSession();
  const onStorage = (e: StorageEvent) => {
    if (e.key === "examMode") checkSession();
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

watch(isExamMode, (active) => {
  if (!active) return;
  const events = ["mousedown", "keydown", "scroll", "touchstart"];
  const handler = () => updateActivity();
  events.forEach((e) =>
    document.addEventListener(e, handler, { passive: true }),
  );
  onUnmounted(() =>
    events.forEach((e) => document.removeEventListener(e, handler)),
  );
});

watch(() => route.path, checkSession);
</script>

<template>
  <div class="flex flex-col max-w-full min-h-screen bg-background">
    <main class="grow">
      <slot />
    </main>
    <AppFooter v-if="!hideFooter && !isExamMode" />
  </div>
</template>
