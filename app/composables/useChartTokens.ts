/**
 * Reads design tokens out of the cascade so charts can be handed real colour
 * values.
 *
 * Charts need colours as plain strings: SVG presentation attributes don't
 * resolve `var()`, so `fill="var(--grade-low)"` renders as nothing. Reading the
 * *computed* value of the custom property gives us the substituted colour, and
 * re-reading it when the colour mode flips is what keeps the marks in step with
 * the rest of the page — the tokens themselves swap under `.dark`.
 */
export type ChartToken =
  | "background"
  | "border"
  | "destructive"
  | "foreground"
  | "grade-fail"
  | "grade-high"
  | "grade-low"
  | "grade-mid"
  | "muted-foreground"
  | "primary"
  | "success"
  | "warning";

export function useChartTokens<T extends ChartToken>(tokens: readonly T[]) {
  const colorMode = useColorMode();

  // `transparent` rather than an empty string: an unresolved token should draw
  // nothing on the server pass instead of falling back to the browser's default
  // black fill for one frame.
  const resolved = ref(
    Object.fromEntries(tokens.map((t) => [t, "transparent"])) as Record<
      T,
      string
    >,
  );

  function resolve() {
    const styles = getComputedStyle(document.documentElement);
    resolved.value = Object.fromEntries(
      tokens.map((t) => [t, styles.getPropertyValue(`--${t}`).trim()]),
    ) as Record<T, string>;
  }

  // Synchronously on the client, not in `onMounted`: a chart that only learns
  // its colours after mounting paints one frame with the placeholder, and a
  // mark that resolves to nothing falls back to the browser's default black.
  if (import.meta.client) resolve();

  onMounted(resolve);

  // `nextTick` because @nuxtjs/color-mode writes the class onto <html> during
  // the same flush — reading before it lands returns the outgoing palette.
  watch(
    () => colorMode.value,
    () => nextTick(resolve),
  );

  return resolved;
}
