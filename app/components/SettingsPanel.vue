<script setup lang="ts">
import { CHAT_MODELS } from "@/composables/useSelectedModel";
import { useLayoutStore } from "~/stores/layout";
import { toast } from "vue-sonner";

defineProps<{ section: string }>();

const colorMode = useColorMode();
const layoutStore = useLayoutStore();
const { layoutMode } = storeToRefs(layoutStore);
const { selectedModelId } = useSelectedModel();
const { showExplainPopover, blurFacitUntilHover } = useSettings();
const { latest: recentSearches, clear: clearRecentSearches } =
  useRecentSearches();

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
  { id: "light", label: "Ljust" },
  { id: "dark", label: "Mörkt" },
  { id: "system", label: "System" },
];

const LAYOUT_OPTIONS = [
  {
    value: "exam-with-facit",
    label: "Tenta och facit",
    hint: "Delad vy sida vid sida.",
  },
  {
    value: "exam-only",
    label: "Endast tenta",
    hint: "Facit glider in från kanten.",
  },
] as const;

const MODEL_OPTIONS = CHAT_MODELS.map((model) => ({
  value: model.id,
  label: model.label,
  hint: model.id === "gemini-3.1-flash-lite" ? "Snabbast." : "Mer utförlig.",
}));

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
  {
    label: "Meddelanden i chatten",
    value: "Max 4 000 tecken",
  },
  {
    label: "Bilagor i en aktiv chatt",
    value: "5 filer, 5 MB per fil och 20 MB totalt",
  },
  {
    label: "Markerad text som skickas till chatten",
    value: "Max 4 000 tecken",
  },
  {
    label: "Senaste sökningar",
    value: "3 kurskoder, sparas i 30 dagar",
  },
  {
    label: "Lock in-historik",
    value: "50 sessioner, sparas lokalt i 30 dagar",
  },
  {
    label: "Chatthistorik",
    value: "Sparas bara när du är inloggad",
  },
  {
    label: "Dina inställningar",
    value: "Sparas i kakor i 12 månader",
  },
];

function handleClearRecentSearches() {
  clearRecentSearches();
  toast.success("Senaste sökningar rensade");
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl">
    <section v-if="section === 'appearance'" class="space-y-6">
      <h2 class="text-xl font-medium text-foreground">Utseende</h2>

      <div>
        <SettingsRow
          label="Tema"
          description="System följer inställningen i din enhet."
          stacked
        >
          <div class="grid grid-cols-3 gap-2">
            <Button
              v-for="option in THEME_OPTIONS"
              :key="option.id"
              variant="outline"
              class="h-auto flex-col gap-2 rounded-2xl py-4 hover:border-primary hover:bg-primary/5"
              :class="
                theme === option.id ? 'border-primary bg-primary/5' : 'bg-card'
              "
              @click="theme = option.id"
            >
              <LucideSun v-if="option.id === 'light'" class="size-4.5" />
              <LucideMoonStar
                v-else-if="option.id === 'dark'"
                class="size-4.5"
              />
              <LucideMonitor v-else class="size-4.5" />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </Button>
          </div>
        </SettingsRow>
      </div>
    </section>

    <section v-else-if="section === 'reading'" class="space-y-6">
      <h2 class="text-xl font-medium text-foreground">Läsvy</h2>

      <div>
        <SettingsRow
          label="Standardvy"
          description="Hur en tenta öppnas. Du kan alltid byta i tentavyn."
          stacked
        >
          <SettingsSegmented
            v-model="defaultLayout"
            :options="LAYOUT_OPTIONS"
          />
        </SettingsRow>

        <SettingsRow
          label="Dölj facit tills du pekar på det"
          description="Gäller delad vy. Med detta av ligger facit framme direkt."
        >
          <Switch v-model="blurFacitUntilHover" />
        </SettingsRow>

        <SettingsRow
          label='Visa "Förklara" vid markering'
          description="Knappen som dyker upp när du markerar text i en tenta och skickar den vidare till AI-chatten."
        >
          <Switch v-model="showExplainPopover" />
        </SettingsRow>
      </div>
    </section>

    <section v-else-if="section === 'ai'" class="space-y-6">
      <h2 class="text-xl font-medium text-foreground">AI-assistenten</h2>

      <div>
        <SettingsRow
          label="Modell"
          description="Vilken modell chatten och förklaringarna använder."
          stacked
        >
          <SettingsSegmented
            v-model="selectedModelId"
            :options="MODEL_OPTIONS"
          />
        </SettingsRow>
      </div>

      <p class="text-sm leading-relaxed text-muted-foreground">
        AI kan göra misstag – se svaren som pedagogiska förslag, inte som facit.
        Läs mer i vår
        <NuxtLink
          to="/ai-policy"
          class="text-foreground underline underline-offset-4"
          >AI-policy</NuxtLink
        >.
      </p>
    </section>

    <section v-else-if="section === 'shortcuts'" class="space-y-6">
      <h2 class="text-xl font-medium text-foreground">Tangentbordsgenvägar</h2>

      <div class="space-y-6">
        <div
          v-for="group in SHORTCUT_GROUPS"
          :key="group.label"
          class="space-y-2"
        >
          <h3 class="text-sm text-muted-foreground">{{ group.label }}</h3>
          <div class="overflow-hidden rounded-2xl border bg-card">
            <div
              v-for="shortcut in group.shortcuts"
              :key="shortcut.action"
              class="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
            >
              <span class="text-sm text-foreground">{{ shortcut.action }}</span>
              <span class="flex shrink-0 items-center gap-1">
                <kbd
                  v-for="key in shortcut.keys"
                  :key="key"
                  class="inline-flex h-7 min-w-7 items-center justify-center rounded-sm border bg-muted px-2 text-sm text-muted-foreground"
                >
                  {{ key }}
                </kbd>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="section === 'fixed'" class="space-y-6">
      <h2 class="text-xl font-medium text-foreground">Fasta gränser</h2>
      <p class="text-sm leading-relaxed text-muted-foreground">
        Sådant som är inbyggt i tjänsten och inte går att ändra.
      </p>

      <dl class="overflow-hidden rounded-2xl border bg-card">
        <div
          v-for="item in FIXED_DEFAULTS"
          :key="item.label"
          class="flex flex-col gap-1 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <dt class="text-sm text-foreground">{{ item.label }}</dt>
          <dd class="text-sm text-muted-foreground sm:text-right">
            {{ item.value }}
          </dd>
        </div>
      </dl>

      <div>
        <SettingsRow
          label="Senaste sökningar"
          :description="
            recentSearches.length
              ? `Sparat på den här enheten: ${recentSearches.map((s) => s.courseCode).join(', ')}.`
              : 'Inga sparade sökningar på den här enheten.'
          "
        >
          <Button
            size="sm"
            variant="outline"
            :disabled="!recentSearches.length"
            @click="handleClearRecentSearches"
          >
            Rensa
          </Button>
        </SettingsRow>
      </div>
    </section>
  </div>
</template>
