import type { Ref } from "vue";

type AsyncStatus = "idle" | "pending" | "success" | "error";

/**
 * A reference-counted registry of everything the page is still waiting for.
 *
 * Nuxt's own indicator finishes on `page:loading:end`, which fires as soon as the
 * route transition resolves. Anything that is not awaited by navigation — a lazy
 * useFetch, or client-only work like loading the PDF engine — is still running at
 * that point, so the bar used to complete while the page was visibly empty. Here
 * the route is just one more registered task, and the bar finishes when the count
 * reaches zero.
 *
 * Counting happens on the client only. A count serialized from the server would
 * hydrate as pending with nothing left alive to release it, pinning the bar.
 */
export function usePageLoading() {
  const pending = useState("page-loading-pending", () => 0);
  const failed = useState("page-loading-failed", () => false);

  /**
   * Registers one task and returns its release function. Releasing twice is a
   * no-op, so a caller can release eagerly and still release again on teardown.
   */
  function begin(): (opts?: { error?: boolean }) => void {
    if (!import.meta.client) return () => {};

    pending.value += 1;
    let released = false;

    return (opts) => {
      if (released) return;
      released = true;
      if (opts?.error) failed.value = true;
      pending.value = Math.max(0, pending.value - 1);
      if (pending.value === 0 && !opts?.error) failed.value = false;
    };
  }

  /** Holds the bar for as long as `isPending` is true. */
  function trackWhile(isPending: () => boolean, onError?: () => boolean) {
    let release: ReturnType<typeof begin> | null = null;

    watch(
      isPending,
      (busy) => {
        if (busy) {
          release ??= begin();
          return;
        }
        release?.({ error: onError?.() });
        release = null;
      },
      { immediate: true },
    );

    // A component that unmounts mid-flight must not pin the bar forever.
    onScopeDispose(() => {
      release?.();
      release = null;
    });
  }

  /** Holds the bar while a useFetch/useAsyncData `status` ref is pending. */
  function track(status: Ref<AsyncStatus>) {
    trackWhile(
      () => status.value === "pending",
      () => status.value === "error",
    );
  }

  return {
    pending,
    failed,
    isLoading: computed(() => pending.value > 0),
    begin,
    track,
    trackWhile,
  };
}
