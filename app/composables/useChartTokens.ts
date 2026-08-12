

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

  if (import.meta.client) resolve();

  onMounted(resolve);

  watch(
    () => colorMode.value,
    () => nextTick(resolve),
  );

  return resolved;
}
