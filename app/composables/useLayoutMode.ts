const layoutMode = ref<"exam-with-facit" | "exam-only">("exam-with-facit");

export function useLayoutMode() {
  return {
    layoutMode: readonly(layoutMode),
    setLayoutMode: (mode: "exam-with-facit" | "exam-only") => {
      layoutMode.value = mode;
    },
  };
}
