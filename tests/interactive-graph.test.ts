import { describe, expect, it } from "bun:test";
import {
  parseAssistantContent,
  parseInteractiveGraphSpec,
} from "../app/lib/interactive-graph";
import {
  compileGraphExpression,
  evaluateGraphExpression,
} from "../app/lib/graph-expression";

const graph = {
  version: 1,
  title: "Normal distribution",
  xAxis: { min: -5, max: 5, label: "x" },
  yAxis: { min: 0, max: 0.8, label: "Density" },
  showGrid: true,
  parameters: [
    { id: "mu", label: "Mean", min: -2, max: 2, step: 0.1, initial: 0 },
    {
      id: "sigma",
      label: "Standard deviation",
      min: 0.2,
      max: 3,
      step: 0.1,
      initial: 1,
    },
  ],
  series: [
    {
      label: "Density",
      expression: "1/(sigma*sqrt(2*PI))*exp(-0.5*((x-mu)/sigma)^2)",
      style: "solid",
    },
  ],
  points: [],
};

describe("interactive graph parsing", () => {
  it("extracts a graph between Markdown segments", () => {
    const content = [
      "Before",
      "```interactive-graph",
      JSON.stringify(graph),
      "```",
      "After",
    ].join("\n");
    const segments = parseAssistantContent(content);

    expect(segments.map((segment) => segment.type)).toEqual([
      "markdown",
      "graph",
      "markdown",
    ]);
    expect(segments[1]).toMatchObject({
      type: "graph",
      spec: { title: "Normal distribution" },
    });
  });

  it("keeps an unfinished streaming artifact hidden", () => {
    const segments = parseAssistantContent(
      "Explanation\n```interactive-graph\n{\"version\":1",
    );
    expect(segments.at(-1)).toEqual({ type: "graph-pending" });
  });

  it("rejects unsafe shapes before rendering", () => {
    expect(() =>
      parseInteractiveGraphSpec({
        ...graph,
        showGrid: "yes",
        series: [{ ...graph.series[0], expression: "window.alert(1);x" }],
      }),
    ).toThrow();
  });

  it("accepts uppercase parameter ids and rejects reserved names", () => {
    const parsed = parseInteractiveGraphSpec({
      ...graph,
      parameters: [
        { id: "A", label: "Amplitude", min: 0, max: 4, step: 0.1, initial: 2 },
        { id: "D", label: "Offset", min: -3, max: 3, step: 0.1, initial: 0 },
      ],
      series: [{ ...graph.series[0], expression: "A*sin(x)+D" }],
    });

    expect(parsed.parameters.map((parameter) => parameter.id)).toEqual(["A", "D"]);
    expect(
      evaluateGraphExpression(
        compileGraphExpression(parsed.series[0].expression, ["A", "D"]),
        Math.PI / 2,
        { A: 2, D: 1 },
      ),
    ).toBeCloseTo(3, 5);

    expect(() =>
      parseInteractiveGraphSpec({
        ...graph,
        parameters: [
          { id: "E", label: "E", min: 0, max: 1, step: 0.1, initial: 0 },
        ],
        series: [{ ...graph.series[0], expression: "E*x" }],
      }),
    ).toThrow();
    expect(() =>
      parseInteractiveGraphSpec({
        ...graph,
        parameters: [
          { id: "sin", label: "sin", min: 0, max: 1, step: 0.1, initial: 0 },
        ],
        series: [{ ...graph.series[0], expression: "sin*x" }],
      }),
    ).toThrow();
  });

  it("truncates oversized display labels without rejecting the graph", () => {
    const parsed = parseInteractiveGraphSpec({
      ...graph,
      series: [{ ...graph.series[0], label: "A".repeat(100) }],
    });

    expect(parsed.series[0].label.length).toBe(48);
    expect(parsed.series[0].label.endsWith("…")).toBe(true);
  });
});

describe("restricted graph expressions", () => {
  it("evaluates parameterized probability functions", () => {
    const expression = compileGraphExpression(
      graph.series[0].expression,
      ["mu", "sigma"],
    );
    const value = evaluateGraphExpression(expression, 0, { mu: 0, sigma: 1 });
    expect(value).toBeCloseTo(0.398942, 5);
  });

  it("rejects unknown variables, member access, and assignment", () => {
    expect(() => compileGraphExpression("secret*x", [])).toThrow("Okänd variabel");
    expect(() => compileGraphExpression("x.constructor", [])).toThrow();
    expect(() => compileGraphExpression("x=2", [])).toThrow();
  });
});
