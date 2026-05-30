export const FONT_OPTIONS = [
  { id: "grotesk", label: "Yet Grotesk" },
  { id: "system", label: "System" },
] as const;

export type FontPreference = (typeof FONT_OPTIONS)[number]["id"];

const VALID_FONT_IDS = new Set<string>(FONT_OPTIONS.map((f) => f.id));
const DEFAULT_FONT: FontPreference = "grotesk";
const FONT_COOKIE_KEY = "liutentor_font_v1";

export function useFontPreference() {
  const font = useCookie<FontPreference>(FONT_COOKIE_KEY, {
    default: () => DEFAULT_FONT,
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!VALID_FONT_IDS.has(font.value)) {
    font.value = DEFAULT_FONT;
  }

  return { font };
}
