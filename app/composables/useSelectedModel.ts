/**
 * The picker is presented as a thinking level rather than a model name: students
 * pick how much effort they want spent, not a vendor. Each level maps to exactly
 * one model, so the mapping stays swappable without touching the UI copy.
 */
export const CHAT_MODELS = [
  {
    id: "gpt-5.6-luna-low",
    label: "Låg",
    hint: "Snabbast. Bra för korta frågor.",
    provider: "OpenAI",
    requiresAuth: false,
  },
  {
    id: "gpt-5.6-luna-medium",
    label: "Balanserad",
    hint: "Standard för de flesta uppgifter.",
    provider: "OpenAI",
    requiresAuth: false,
  },
  {
    id: "gpt-5.6-terra-high",
    label: "Djup",
    hint: "Tänker längre. Bäst på svåra uppgifter.",
    provider: "OpenAI",
    requiresAuth: true,
  },
] as const;

const DEFAULT_MODEL_ID = "gpt-5.6-luna-low";
const VALID_MODEL_ID_SET = new Set<string>(CHAT_MODELS.map((m) => m.id));
const AUTHED_ONLY_MODEL_IDS = new Set<string>(
  CHAT_MODELS.filter((m) => m.requiresAuth).map((m) => m.id),
);
const MODEL_COOKIE_KEY = "liutentor_selected_model_v13";

const LEGACY_MODEL_COOKIE_KEYS = [
  "liutentor_selected_model_v12",
  "liutentor_selected_model_v11",
  "liutentor_selected_model_v10",
  "liutentor_selected_model",
  "liutentor_selected_model_v9",
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
  const user = useSupabaseUser();
  const selectedModelId = useCookie<string>(MODEL_COOKIE_KEY, {
    default: () => DEFAULT_MODEL_ID,
    maxAge: 60 * 60 * 24 * 365,
  });

  for (const key of LEGACY_MODEL_COOKIE_KEYS) {
    const legacy = useCookie(key);
    if (legacy.value !== null) {
      legacy.value = null;
    }
  }

  const availableModels = computed(() =>
    CHAT_MODELS.filter((model) => !model.requiresAuth || !!user.value),
  );

  const isSelectable = (id: string) =>
    VALID_MODEL_ID_SET.has(id) &&
    (!AUTHED_ONLY_MODEL_IDS.has(id) || !!user.value);

  // Signing out has to drop a gated tier, or the picker keeps showing a level
  // the backend will reject. Runs immediately so SSR never emits a stale label.
  watchEffect(() => {
    if (!isSelectable(selectedModelId.value)) {
      selectedModelId.value = DEFAULT_MODEL_ID;
    }
  });

  return { selectedModelId, availableModels };
}
