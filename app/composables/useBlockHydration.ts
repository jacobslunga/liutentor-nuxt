import { watch, onUnmounted, type Ref } from "vue";

interface BlockHydrationConfig {
  selector: string;
  sourceSelector: string;
  render: (source: string, el: HTMLElement) => Promise<void>;
  rerenderOnResize?: boolean;
}

export function useBlockHydration(
  container: Ref<HTMLElement | null>,
  config: BlockHydrationConfig,
) {
  async function renderBlock(el: HTMLElement) {
    const source =
      el.querySelector(config.sourceSelector)?.textContent?.trim() ?? "";
    if (!source) {
      el.dataset.state = "error";
      return;
    }

    el.dataset.state = "rendering";

    try {
      await config.render(source, el);
      el.dataset.state = "done";
    } catch {
      el.dataset.state = "error";
    }
  }

  function hydrate() {
    const root = container.value;
    if (!root) return;

    const blocks = root.querySelectorAll<HTMLElement>(
      `${config.selector}[data-state="pending"]`,
    );
    blocks.forEach((el) => {
      if (el.closest('[data-streaming="true"]')) return;
      void renderBlock(el);
    });
  }

  function rerenderAll() {
    const root = container.value;
    if (!root) return;

    root
      .querySelectorAll<HTMLElement>(`${config.selector}[data-state="done"]`)
      .forEach((el) => {
        el.dataset.state = "pending";
      });
    hydrate();
  }

  if (config.rerenderOnResize) {
    let observer: ResizeObserver | null = null;
    let resizeTimer = 0;
    let lastWidth = 0;

    watch(
      container,
      (el) => {
        observer?.disconnect();
        observer = null;
        if (!el) return;
        lastWidth = el.clientWidth;
        observer = new ResizeObserver(() => {
          const width = el.clientWidth;
          if (!width || width === lastWidth) return;
          lastWidth = width;
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => rerenderAll(), 250);
        });
        observer.observe(el);
      },
      { immediate: true, flush: "post" },
    );

    onUnmounted(() => {
      observer?.disconnect();
      window.clearTimeout(resizeTimer);
    });
  }

  return { hydrate, rerenderAll };
}
