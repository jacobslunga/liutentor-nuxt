import { watch, type Ref } from "vue";
import DOMPurify from "dompurify";
import type { MermaidConfig } from "mermaid";
import { useBlockHydration } from "@/composables/useBlockHydration";

type MermaidInstance = typeof import("mermaid")["default"];

const BASE_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: "strict",
  suppressErrorRendering: true,
  fontFamily: "inherit",
};

export function useMermaid(container: Ref<HTMLElement | null>) {
  const colorMode = useColorMode();

  let mermaidPromise: Promise<MermaidInstance> | null = null;

  function currentTheme(): "dark" | "neutral" {
    return colorMode.value === "dark" ? "dark" : "neutral";
  }

  function getMermaid(): Promise<MermaidInstance> {
    if (!mermaidPromise) {
      mermaidPromise = import("mermaid")
        .then(({ default: mermaid }) => {
          mermaid.initialize({ ...BASE_CONFIG, theme: currentTheme() });
          return mermaid;
        })
        .catch((err) => {
          mermaidPromise = null;
          throw err;
        });
    }
    return mermaidPromise;
  }

  function sanitizeSvg(svg: string): string {
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true, html: true },
      ADD_TAGS: ["foreignObject"],
      ADD_ATTR: ["dominant-baseline", "transform-origin"],
      HTML_INTEGRATION_POINTS: { "annotation-xml": true, foreignobject: true },
    });
  }

  const { hydrate, rerenderAll } = useBlockHydration(container, {
    selector: ".mermaid-block",
    sourceSelector: ".mermaid-source",
    async render(source, el) {
      const id = `mmd-${crypto.randomUUID()}`;

      try {
        const mermaid = await getMermaid();
        const { svg } = await mermaid.render(id, source);

        let host = el.querySelector<HTMLElement>(".mermaid-svg");
        if (!host) {
          host = document.createElement("div");
          host.className = "mermaid-svg";
          el.appendChild(host);
        }
        host.innerHTML = sanitizeSvg(svg);
      } catch (err) {
        document.getElementById(id)?.remove();
        el.querySelector(".mermaid-svg")?.remove();
        throw err;
      }
    },
  });

  watch(
    () => colorMode.value,
    async () => {
      if (!mermaidPromise) return;
      const mermaid = await getMermaid();
      mermaid.initialize({ ...BASE_CONFIG, theme: currentTheme() });
      rerenderAll();
    },
  );

  return { hydrate };
}
