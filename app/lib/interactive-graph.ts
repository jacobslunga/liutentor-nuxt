export interface InteractiveGraphAxis {
  min: number;
  max: number;
  label?: string;
}

export interface InteractiveGraphParameter {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

export interface InteractiveGraphSeries {
  label: string;
  expression: string;
  style: "solid" | "dashed";
}

export interface InteractiveGraphPoint {
  x: number;
  y: number;
  label?: string;
}

export interface InteractiveGraphSpec {
  version: 1;
  title: string;
  description?: string;
  xAxis: InteractiveGraphAxis;
  yAxis: InteractiveGraphAxis;
  showGrid: boolean;
  parameters: InteractiveGraphParameter[];
  series: InteractiveGraphSeries[];
  points: InteractiveGraphPoint[];
}

export type AssistantContentSegment =
  | { type: "markdown"; content: string }
  | { type: "graph"; spec: InteractiveGraphSpec }
  | { type: "graph-pending" }
  | { type: "graph-error"; message: string };

const GRAPH_FENCE_OPEN = /```interactive-graph[^\S\r\n]*\r?\n/g;
const GRAPH_FENCE_CLOSE = /^[\t ]*```[\t ]*(?:\r?\n|$)/gm;
const EXPRESSION_PATTERN = /^[0-9A-Za-z_+\-*/^().,\s]+$/;
const PARAMETER_ID_PATTERN = /^[a-z][a-z0-9_]{0,23}$/;
const RESERVED_PARAMETER_IDS = new Set(["x", "PI", "E"]);
const MAX_COORDINATE = 1_000_000;
const MAX_DISPLAY_TEXT_INPUT = 2_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteCoordinate(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Math.abs(value) <= MAX_COORDINATE
  );
}

function optionalText(value: unknown, maxLength: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error("Ogiltig text i grafen");
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_DISPLAY_TEXT_INPUT) {
    throw new Error("Grafen innehåller orimligt lång text");
  }
  return trimmed.length <= maxLength
    ? trimmed
    : `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function requiredText(value: unknown, maxLength: number): string {
  const text = optionalText(value, maxLength);
  if (!text) throw new Error("Grafen saknar text");
  return text;
}

function optionalBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") {
    throw new Error("Grafen har ett ogiltigt rutnätsvärde");
  }
  return value;
}

function parseAxis(value: unknown): InteractiveGraphAxis {
  if (!isRecord(value)) throw new Error("Grafen har en ogiltig axel");
  if (!isFiniteCoordinate(value.min) || !isFiniteCoordinate(value.max)) {
    throw new Error("Grafen har ett ogiltigt axelintervall");
  }
  if (value.min >= value.max) {
    throw new Error("Grafens axelintervall är omvänt");
  }
  return {
    min: value.min,
    max: value.max,
    ...(value.label === undefined ? {} : { label: optionalText(value.label, 32) }),
  };
}

function parseParameter(value: unknown): InteractiveGraphParameter {
  if (!isRecord(value)) throw new Error("Grafen har en ogiltig parameter");
  if (typeof value.id !== "string" || !PARAMETER_ID_PATTERN.test(value.id)) {
    throw new Error("Grafen har ett ogiltigt parameter-ID");
  }
  if (
    !isFiniteCoordinate(value.min) ||
    !isFiniteCoordinate(value.max) ||
    !isFiniteCoordinate(value.initial) ||
    typeof value.step !== "number" ||
    !Number.isFinite(value.step) ||
    value.step <= 0 ||
    value.step > 100_000
  ) {
    throw new Error("Grafen har ett ogiltigt parameterintervall");
  }
  if (
    value.min >= value.max ||
    value.initial < value.min ||
    value.initial > value.max
  ) {
    throw new Error("Grafens parametervärde ligger utanför intervallet");
  }
  return {
    id: value.id,
    label: requiredText(value.label, 40),
    min: value.min,
    max: value.max,
    step: value.step,
    initial: value.initial,
  };
}

function parseSeries(value: unknown): InteractiveGraphSeries {
  if (!isRecord(value)) throw new Error("Grafen har en ogiltig kurva");
  if (typeof value.expression !== "string") {
    throw new Error("Grafen saknar ett funktionsuttryck");
  }
  const expression = value.expression.trim();
  if (!expression || expression.length > 240 || !EXPRESSION_PATTERN.test(expression)) {
    throw new Error("Grafen innehåller otillåtna tecken");
  }
  const style = value.style ?? "solid";
  if (style !== "solid" && style !== "dashed") {
    throw new Error("Grafen har en ogiltig linjestil");
  }
  return {
    label: requiredText(value.label, 48),
    expression,
    style,
  };
}

function parsePoint(value: unknown): InteractiveGraphPoint {
  if (!isRecord(value) || !isFiniteCoordinate(value.x) || !isFiniteCoordinate(value.y)) {
    throw new Error("Grafen har en ogiltig punkt");
  }
  return {
    x: value.x,
    y: value.y,
    ...(value.label === undefined ? {} : { label: optionalText(value.label, 32) }),
  };
}

export function parseInteractiveGraphSpec(value: unknown): InteractiveGraphSpec {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("Grafversionen stöds inte");
  }

  const rawParameters = value.parameters ?? [];
  const rawSeries = value.series;
  const rawPoints = value.points ?? [];
  if (!Array.isArray(rawParameters) || rawParameters.length > 4) {
    throw new Error("Grafen har för många parametrar");
  }
  if (!Array.isArray(rawSeries) || rawSeries.length < 1 || rawSeries.length > 4) {
    throw new Error("Grafen måste ha mellan en och fyra kurvor");
  }
  if (!Array.isArray(rawPoints) || rawPoints.length > 12) {
    throw new Error("Grafen har för många punkter");
  }

  const parameters = rawParameters.map(parseParameter);
  const ids = new Set<string>();
  for (const parameter of parameters) {
    if (RESERVED_PARAMETER_IDS.has(parameter.id) || ids.has(parameter.id)) {
      throw new Error("Grafens parameter-ID:n är inte unika");
    }
    ids.add(parameter.id);
  }

  return {
    version: 1,
    title: requiredText(value.title, 100),
    ...(value.description === undefined
      ? {}
      : { description: optionalText(value.description, 240) }),
    xAxis: parseAxis(value.xAxis),
    yAxis: parseAxis(value.yAxis),
    showGrid: optionalBoolean(value.showGrid, true),
    parameters,
    series: rawSeries.map(parseSeries),
    points: rawPoints.map(parsePoint),
  };
}

export function parseAssistantContent(content: string): AssistantContentSegment[] {
  const segments: AssistantContentSegment[] = [];
  let cursor = 0;
  GRAPH_FENCE_OPEN.lastIndex = 0;

  for (let match = GRAPH_FENCE_OPEN.exec(content); match; match = GRAPH_FENCE_OPEN.exec(content)) {
    if (match.index > cursor) {
      segments.push({ type: "markdown", content: content.slice(cursor, match.index) });
    }

    const sourceStart = GRAPH_FENCE_OPEN.lastIndex;
    GRAPH_FENCE_CLOSE.lastIndex = sourceStart;
    const closingMatch = GRAPH_FENCE_CLOSE.exec(content);
    if (!closingMatch) {
      segments.push({ type: "graph-pending" });
      cursor = content.length;
      break;
    }

    const raw = content.slice(sourceStart, closingMatch.index).trim();
    try {
      segments.push({
        type: "graph",
        spec: parseInteractiveGraphSpec(JSON.parse(raw)),
      });
    } catch (error) {
      segments.push({
        type: "graph-error",
        message: error instanceof Error ? error.message : "Grafen är ogiltig",
      });
    }

    cursor = GRAPH_FENCE_CLOSE.lastIndex;
    GRAPH_FENCE_OPEN.lastIndex = cursor;
  }

  if (cursor < content.length) {
    segments.push({ type: "markdown", content: content.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ type: "markdown", content }];
}
