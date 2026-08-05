/**
 * Reading-view preferences. Cookies rather than localStorage on purpose: both
 * of these decide what the very first paint of an exam page looks like, and a
 * client-only store would render the default and then correct itself.
 */
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
