

const EXPLAIN_POPOVER_KEY = "liutentor_show_explain_popover";
const BLUR_FACIT_KEY = "liutentor_blur_facit";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function useSettings() {
  const showExplainPopover = useCookie<boolean>(EXPLAIN_POPOVER_KEY, {
    default: () => true,
    maxAge: ONE_YEAR,
  });

  const blurFacitUntilHover = useCookie<boolean>(BLUR_FACIT_KEY, {
    default: () => true,
    maxAge: ONE_YEAR,
  });

  return { showExplainPopover, blurFacitUntilHover };
}
