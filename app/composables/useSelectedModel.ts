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
] as const;

const VALID_MODEL_IDS = CHAT_MODELS.map((m) => m.id);
const DEFAULT_MODEL_ID = "gemini-3.1-flash-lite";
const VALID_MODEL_ID_SET = new Set<string>(VALID_MODEL_IDS);
const MODEL_COOKIE_KEY = "liutentor_selected_model";

const LEGACY_MODEL_COOKIE_KEYS = [
  "liutentor_selected_model_v8",
  "liutentor_selected_model_v7",
  "liutentor_selected_model_v6",
  "liutentor_selected_model_v5",
  "liutentor_selected_model_v4",
  "liutentor_selected_model_v3",
  "liutentor_selected_model_v2",
  "liutentor_selected_model_v1",
];

export function useSelectedModel() {
  const selectedModelId = useCookie<string>(MODEL_COOKIE_KEY, {
    default: () => DEFAULT_MODEL_ID,
    maxAge: 60 * 60 * 24 * 365,
  });

  // Clean up legacy versioned cookies
  for (const key of LEGACY_MODEL_COOKIE_KEYS) {
    const legacy = useCookie(key);
    if (legacy.value !== null) {
      legacy.value = null;
    }
  }

  // Anything not on the list above falls back to the default. This is also
  // what migrates the users still holding a retired `claude-*` id in their
  // cookie — no separate cleanup pass needed.
  if (!VALID_MODEL_ID_SET.has(selectedModelId.value)) {
    selectedModelId.value = DEFAULT_MODEL_ID;
  }

  return { selectedModelId };
}
