export function useLayoutMode() {
  const layoutModeCookie = useCookie<"exam-with-facit" | "exam-only">(
    "layoutMode",
    {
      default: () => "exam-with-facit",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  );

  return {
    layoutMode: readonly(layoutModeCookie),
    setLayoutMode: (mode: "exam-with-facit" | "exam-only") => {
      layoutModeCookie.value = mode;
    },
  };
}
