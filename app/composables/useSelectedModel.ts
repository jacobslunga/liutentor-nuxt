const VALID_MODEL_IDS = ["gemini-2.5-pro", "gpt-4o"];

export function useSelectedModel() {
  const selectedModelId = useCookie("liutentor_selected_model_v3", {
    default: () => "gpt-4o",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!VALID_MODEL_IDS.includes(selectedModelId.value)) {
    selectedModelId.value = "gpt-4o";
  }

  return { selectedModelId };
}
