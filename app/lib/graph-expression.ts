import { Parser, type Expression } from "expr-eval";

const ALLOWED_FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "sqrt",
  "log",
  "ln",
  "lg",
  "log10",
  "abs",
  "ceil",
  "floor",
  "round",
  "trunc",
  "exp",
  "cbrt",
  "expm1",
  "log1p",
  "sign",
  "log2",
]);

function createRestrictedParser(): Parser {
  const parser = new Parser({
    allowMemberAccess: false,
    operators: {
      assignment: false,
      comparison: false,
      concatenate: false,
      conditional: false,
      factorial: false,
      fndef: false,
      in: false,
      logical: false,
      random: false,
      remainder: false,
    },
  });
  for (const name of Object.keys(parser.functions)) {
    if (!ALLOWED_FUNCTIONS.has(name)) delete parser.functions[name];
  }
  return parser;
}

export function compileGraphExpression(
  source: string,
  parameterIds: string[],
): Expression {
  const expression = createRestrictedParser().parse(source);
  const allowedVariables = new Set(["x", ...parameterIds]);
  const unsupported = expression
    .variables()
    .filter((name) => !allowedVariables.has(name));
  if (unsupported.length > 0) {
    throw new Error(`Okänd variabel: ${unsupported[0]}`);
  }
  return expression;
}

export function evaluateGraphExpression(
  expression: Expression,
  x: number,
  parameters: Record<string, number>,
): number {
  const result = expression.evaluate({ x, ...parameters });
  return typeof result === "number" && Number.isFinite(result)
    ? result
    : Number.NaN;
}
