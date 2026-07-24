export const CHAT_MODELS = [
  {
    id: "gemini-3.1-flash-lite",
    label: "3.1 Flash Lite",
    provider: "Google",
  },
  {
    id: "gemini-3.6-flash",
    label: "3.6 Flash",
    provider: "Google",
  },
  {
    id: "claude-haiku-4-5",
    label: "Haiku",
    provider: "Anthropic",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet",
    provider: "Anthropic",
  },
] as const;

const VALID_MODEL_IDS = CHAT_MODELS.map((m) => m.id);
const DEFAULT_MODEL_ID = "gemini-3.1-flash-lite";
const VALID_MODEL_ID_SET = new Set<string>(VALID_MODEL_IDS);
const MODEL_COOKIE_KEY = "liutentor_selected_model_v8";
const LEGACY_MODEL_COOKIE_KEYS = [
  "liutentor_selected_model_v7",
  "liutentor_selected_model_v6",
  "liutentor_selected_model_v4",
  "liutentor_selected_model_v3",
  "liutentor_selected_model_v2",
  "liutentor_selected_model_v1",
  "liutentor_selected_model",
];

export function useSelectedModel() {
  const selectedModelId = useCookie<string>(MODEL_COOKIE_KEY, {
    default: () => DEFAULT_MODEL_ID,
    maxAge: 60 * 60 * 24 * 365,
  });

  const legacyCookieRefs = LEGACY_MODEL_COOKIE_KEYS.map((key) =>
    useCookie<string | null>(key),
  );

  if (!VALID_MODEL_ID_SET.has(selectedModelId.value)) {
    const migratedLegacyValue = legacyCookieRefs
      .map((cookieRef) => cookieRef.value)
      .find(
        (value): value is string => !!value && VALID_MODEL_ID_SET.has(value),
      );

    selectedModelId.value = migratedLegacyValue ?? DEFAULT_MODEL_ID;
  }

  // Remove deprecated cookie versions after optional migration.
  for (const legacyCookieRef of legacyCookieRefs) {
    legacyCookieRef.value = null;
  }

  return { selectedModelId };
}
