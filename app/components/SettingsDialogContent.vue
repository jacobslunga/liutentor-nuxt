<script setup lang="ts">
import { useLayoutStore } from "~/stores/layout";
import { toast } from "vue-sonner";

const colorMode = useColorMode();
const layoutStore = useLayoutStore();
const { layoutMode } = storeToRefs(layoutStore);
const { selectedModelId, availableModels } = useSelectedModel();
const { showExplainPopover, blurFacitUntilHover } = useSettings();
const { latest: recentSearches, clear: clearRecentSearches } =
  useRecentSearches();

// "dim" var det gamla namnet på den mjukare mörka paletten och kan ligga kvar i
// sparade inställningar. Här visas den som "Mörkt".
const theme = computed({
  get: () => (colorMode.preference === "dim" ? "dark" : colorMode.preference),
  set: (value: string) => {
    colorMode.preference = value;
  },
});

const defaultLayout = computed({
  get: () => layoutMode.value as string,
  set: (value: string) => {
    layoutStore.setLayoutMode(value as "exam-with-facit" | "exam-only");
  },
});

const THEME_OPTIONS = [
  { value: "light", label: "Ljust" },
  { value: "dark", label: "Mörkt" },
  { value: "system", label: "System" },
] as const;

const LAYOUT_OPTIONS = [
  { value: "exam-with-facit", label: "Tenta och facit" },
  { value: "exam-only", label: "Endast tenta" },
] as const;

const MODEL_OPTIONS = computed(() =>
  availableModels.value.map((model) => ({
    value: model.id,
    label: model.label,
    hint: model.hint,
  })),
);

const SHORTCUT_GROUPS = [
  {
    label: "Synlighet",
    shortcuts: [
      { action: "Visa eller dölj facit", keys: ["E"] },
      { action: "Visa eller dölj facit på mobil", keys: ["F"] },
      { action: "Visa eller dölj AI-chatten", keys: ["C"] },
      { action: "Stäng chatt och facit", keys: ["Esc"] },
    ],
  },
  {
    label: "Layout",
    shortcuts: [
      { action: "Flytta delningslinjen i delad vy", keys: ["←", "→"] },
    ],
  },
  {
    label: "Chatten",
    shortcuts: [
      { action: "Skicka meddelande", keys: ["Enter"] },
      { action: "Ny rad", keys: ["Shift", "Enter"] },
    ],
  },
];

const FIXED_DEFAULTS = [
  { label: "Meddelanden i chatten", value: "Max 4 000 tecken" },
  { label: "Bilagor i en aktiv chatt", value: "5 filer, 5 MB per fil, 20 MB totalt" },
  { label: "Markerad text till chatten", value: "Max 4 000 tecken" },
  { label: "Senaste sökningar", value: "3 kurskoder, sparas i 30 dagar" },
  { label: "Lock in-historik", value: "50 sessioner, sparas lokalt i 30 dagar" },
  { label: "Chatthistorik", value: "Sparas bara när du är inloggad" },
  { label: "Dina inställningar", value: "Sparas i kakor i 12 månader" },
];

function handleClearRecentSearches() {
  clearRecentSearches();
  toast.success("Senaste sökningar rensade");
}
</script>

<template>
  <div class="flex flex-col gap-6 pt-1">
    <section>
      <h3 class="text-xs font-medium text-muted-foreground">Utseende</h3>
      <SettingsRow label="Tema" description="System följer inställningen i din enhet.">
        <SettingsSelect v-model="theme" :options="THEME_OPTIONS" content-class="w-40">
          <template #icon>
            <LucideSun v-if="theme === 'light'" class="size-3.5" />
            <LucideMoonStar v-else-if="theme === 'dark'" class="size-3.5" />
            <LucideMonitor v-else class="size-3.5" />
          </template>
        </SettingsSelect>
      </SettingsRow>
    </section>

    <section>
      <h3 class="text-xs font-medium text-muted-foreground">Läsvy</h3>
      <SettingsRow label="Standardvy" description="Hur en tenta öppnas. Du kan alltid byta i tentavyn.">
        <SettingsSelect v-model="defaultLayout" :options="LAYOUT_OPTIONS" />
      </SettingsRow>

      <SettingsRow label="Dölj facit tills du pekar på det"
        description="Gäller delad vy. Med detta av ligger facit framme direkt.">
        <Switch v-model="blurFacitUntilHover" />
      </SettingsRow>

      <SettingsRow label='Visa "Förklara" vid markering'
        description="Knappen som dyker upp när du markerar text i en tenta.">
        <Switch v-model="showExplainPopover" />
      </SettingsRow>
    </section>

    <section>
      <h3 class="text-xs font-medium text-muted-foreground">AI-assistenten</h3>
      <SettingsRow label="Tankenivå" description="Hur mycket chatten tänker innan den svarar.">
        <SettingsSelect v-model="selectedModelId" :options="MODEL_OPTIONS" content-class="w-56" />
      </SettingsRow>

      <p class="pt-3.5 text-xs leading-relaxed text-muted-foreground">
        AI kan göra misstag – se svaren som pedagogiska förslag, inte som facit.
        Läs mer i vår
        <NuxtLink to="/ai-policy" class="text-foreground underline underline-offset-4">AI-policy</NuxtLink>.
      </p>
    </section>

    <section class="space-y-3">
      <h3 class="text-xs font-medium text-muted-foreground">Tangentbordsgenvägar</h3>
      <div v-for="group in SHORTCUT_GROUPS" :key="group.label" class="space-y-1.5">
        <h4 class="text-xs text-muted-foreground/70">{{ group.label }}</h4>
        <div class="overflow-hidden rounded-md border bg-card">
          <div v-for="shortcut in group.shortcuts" :key="shortcut.action"
            class="flex items-center justify-between gap-4 border-b border-border px-3 py-2 last:border-b-0">
            <span class="min-w-0 text-sm text-foreground">{{ shortcut.action }}</span>
            <span class="flex shrink-0 items-center gap-1">
              <kbd v-for="key in shortcut.keys" :key="key"
                class="inline-flex h-6 min-w-6 items-center justify-center rounded-sm border bg-muted px-1.5 text-xs text-muted-foreground">
                {{ key }}
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <h3 class="text-xs font-medium text-muted-foreground">Fasta gränser</h3>
      <dl class="overflow-hidden rounded-md border bg-card">
        <div v-for="item in FIXED_DEFAULTS" :key="item.label"
          class="flex items-baseline justify-between gap-4 border-b border-border px-3 py-2 last:border-b-0">
          <dt class="text-sm text-foreground">{{ item.label }}</dt>
          <dd class="shrink-0 text-right text-xs text-muted-foreground">
            {{ item.value }}
          </dd>
        </div>
      </dl>

      <SettingsRow label="Senaste sökningar" :description="recentSearches.length
        ? `Sparat på den här enheten: ${recentSearches.map((s) => s.courseCode).join(', ')}.`
        : 'Inga sparade sökningar på den här enheten.'">
        <Button size="sm" variant="outline" :disabled="!recentSearches.length" @click="handleClearRecentSearches">
          Rensa
        </Button>
      </SettingsRow>
    </section>
  </div>
</template>
