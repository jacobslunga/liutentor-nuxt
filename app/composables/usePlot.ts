import { watch, type Ref } from "vue";
import { z } from "zod";
import { useBlockHydration } from "@/composables/useBlockHydration";

type FunctionPlot = typeof import("function-plot")["default"];
type FunctionPlotOptions = Parameters<FunctionPlot>[0];

const rangeTuple = z.tuple([z.number(), z.number()]);

const plotSchema = z.object({
  title: z.string().optional(),
  xDomain: rangeTuple.optional(),
  yDomain: rangeTuple.optional(),
  functions: z
    .array(
      z.object({
        fn: z.string(),
        label: z.string().optional(),
        dashed: z.boolean().optional(),
        closed: z.boolean().optional(),
        range: rangeTuple.optional(),
        fnType: z.enum(["linear", "implicit", "polar"]).optional(),
        r: z.string().optional(),
        derivative: z.object({ fn: z.string() }).optional(),
      }),
    )
    .min(1)
    .max(4),
  points: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        label: z.string().optional(),
        open: z.boolean().optional(),
      }),
    )
    .optional(),
  annotations: z
    .array(
      z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        text: z.string().optional(),
      }),
    )
    .optional(),
});

type PlotSpec = z.infer<typeof plotSchema>;

const PALETTE_VARS = ["--primary", "--chart-5", "--chart-4", "--chart-3"];

const MAX_WIDTH = 640;
const MIN_WIDTH = 280;
const HEIGHT = 380;

export function usePlot(container: Ref<HTMLElement | null>) {
  const colorMode = useColorMode();

  let plotPromise: Promise<FunctionPlot> | null = null;

  function getFunctionPlot(): Promise<FunctionPlot> {
    if (!plotPromise) {
      plotPromise = import("function-plot")
        .then((mod) => mod.default)
        .catch((err) => {
          plotPromise = null;
          throw err;
        });
    }
    return plotPromise;
  }

  function resolveColor(styles: CSSStyleDeclaration, name: string): string {
    return styles.getPropertyValue(name).trim() || "currentColor";
  }

  function buildData(spec: PlotSpec): FunctionPlotOptions["data"] {
    const styles = getComputedStyle(document.documentElement);
    const palette = PALETTE_VARS.map((name) => resolveColor(styles, name));

    const data = spec.functions.map((f, i) => {
      const entry: Record<string, unknown> = {
        color: palette[i % palette.length],
      };

      if (f.fnType === "polar") {
        entry.fnType = "polar";
        entry.graphType = "polyline";
        entry.r = f.r ?? f.fn;
      } else if (f.fnType === "implicit") {
        entry.fnType = "implicit";
        entry.fn = f.fn;
      } else {
        entry.fn = f.fn;
      }

      if (f.range) entry.range = f.range;

      if (f.closed && f.fnType !== "implicit") {
        entry.closed = true;
        entry.graphType = "polyline";
      }

      if (f.dashed && f.fnType !== "implicit") {
        entry.graphType = "polyline";
        entry.attr = { "stroke-dasharray": "6,6", "stroke-opacity": 0.75 };
      }

      if (f.derivative) {
        entry.derivative = { fn: f.derivative.fn, updateOnMouseMove: true };
      }

      return entry;
    });

    if (spec.points?.length) {
      data.push({
        points: spec.points.map((p) => [p.x, p.y]),
        fnType: "points",
        graphType: "scatter",
        color: resolveColor(styles, "--foreground"),
      });
    }

    return data as FunctionPlotOptions["data"];
  }

  function buildOptions(spec: PlotSpec, host: HTMLElement, width: number) {
    const options: FunctionPlotOptions = {
      target: host,
      width,
      height: HEIGHT,
      grid: true,
      disableZoom: true,
      data: buildData(spec),
    };

    if (spec.xDomain) options.xDomain = spec.xDomain;
    if (spec.yDomain) options.yDomain = spec.yDomain;

    const annotations = (spec.annotations ?? []).filter(
      (a) => a.x !== undefined || a.y !== undefined,
    );
    if (annotations.length) options.annotations = annotations;

    return options;
  }

  const { hydrate, rerenderAll } = useBlockHydration(container, {
    selector: ".plot-block",
    sourceSelector: ".plot-source",
    rerenderOnResize: true,
    async render(source, el) {
      const spec = plotSchema.parse(JSON.parse(source));
      const functionPlot = await getFunctionPlot();

      el.querySelector(".plot-render")?.remove();
      const wrap = document.createElement("div");
      wrap.className = "plot-render";

      if (spec.title) {
        const title = document.createElement("div");
        title.className = "plot-title";
        title.textContent = spec.title;
        wrap.appendChild(title);
      }

      const host = document.createElement("div");
      host.className = "plot-host";
      wrap.appendChild(host);
      el.appendChild(wrap);

      const width = Math.max(
        MIN_WIDTH,
        Math.min(el.clientWidth - 24 || MAX_WIDTH, MAX_WIDTH),
      );

      try {
        functionPlot(buildOptions(spec, host, width));
      } catch (err) {
        wrap.remove();
        throw err;
      }
    },
  });

  watch(
    () => colorMode.value,
    () => {
      if (!plotPromise) return;
      rerenderAll();
    },
  );

  return { hydrate };
}
