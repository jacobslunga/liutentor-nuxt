const VALID_MODEL_IDS = [
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-pro",
  "grok-4-1-fast-non-reasoning",
];

export function useSelectedModel() {
  const selectedModelId = useCookie("liutentor_selected_model_v2", {
    default: () => "grok-4-1-fast-non-reasoning",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!VALID_MODEL_IDS.includes(selectedModelId.value)) {
    selectedModelId.value = "grok-4-1-fast-non-reasoning";
  }

  return { selectedModelId };
}
