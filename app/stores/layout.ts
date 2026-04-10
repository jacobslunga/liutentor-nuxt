import { defineStore } from "pinia";

export const useLayoutStore = defineStore("layout", () => {
  const layoutModeCookie = useCookie<"exam-with-facit" | "exam-only">(
    "layoutMode",
    {
      default: () => "exam-with-facit",
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      watch: true,
    },
  );

  const layoutMode = computed(() => layoutModeCookie.value);

  function setLayoutMode(mode: "exam-with-facit" | "exam-only") {
    layoutModeCookie.value = mode;
  }

  return {
    layoutMode,
    setLayoutMode,
  };
});
