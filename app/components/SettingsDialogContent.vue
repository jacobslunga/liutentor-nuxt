<script setup lang="ts">
const colorMode = useColorMode();

const theme = computed({
  get: () => colorMode.preference,
  set: (val) => {
    colorMode.preference = val;
  },
});

const themeOptions = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

const textSize = ref<"liten" | "standard" | "stor">("standard");

const textSizeOptions = [
  { id: "liten", label: "Liten" },
  { id: "standard", label: "Standard" },
  { id: "stor", label: "Stor" },
];

watch(textSize, (val) => {
  const map = { liten: "14px", standard: "16px", stor: "18px" };
  document.documentElement.style.fontSize = map[val];
});

type FontOption = "system" | "liu-tentor-sans";

const fontOptions: { id: FontOption; label: string; preview: string; family: string }[] = [
  {
    id: "liu-tentor-sans",
    label: "LiU Tentor Sans",
    preview: "Aa",
    family: "'LiU Tentor Sans', sans-serif",
  },
  {
    id: "system",
    label: "System",
    preview: "Aa",
    family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
];

const fontCookie = useCookie<FontOption>("font-preference", {
  default: () => "liu-tentor-sans",
  maxAge: 60 * 60 * 24 * 365,
});

const font = ref<FontOption>(fontCookie.value);

const applyFont = (val: FontOption) => {
  const chosen = fontOptions.find((f) => f.id === val);
  document.body.style.fontFamily = chosen ? chosen.family : "";
};

watch(font, (val) => {
  fontCookie.value = val;
  applyFont(val);
});

onMounted(() => applyFont(font.value));

const shortcuts = [
  { action: "Visa/dölj facit", key: "E", category: "visibility" },
  { action: "Visa/dölj AI-chat", key: "C", category: "visibility" },
];

const categories = [{ id: "visibility", label: "Synlighet" }];
</script>

<template>
  <div class="flex flex-col gap-6 pt-2">
    <div class="space-y-3">
      <h3 class="font-normal">Tema</h3>
      <div class="flex gap-2">
        <div
          v-for="opt in themeOptions"
          :key="opt.id"
          class="flex-1 cursor-pointer rounded-md border transition-all select-none flex flex-col items-center justify-center gap-2 py-4 hover:bg-primary/5 hover:border-primary"
          :class="
            theme === opt.id
              ? 'bg-primary/5 border-primary'
              : 'bg-card border-border'
          "
          @click="theme = opt.id"
        >
          <LucideSun v-if="opt.id === 'light'" class="w-4.5 h-4.5" />
          <LucideMoonStar v-else-if="opt.id === 'dark'" class="w-4.5 h-4.5" />
          <LucideMonitor v-else class="w-4.5 h-4.5" />
          <span class="text-sm font-normal">{{ opt.label }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="font-normal">Textstorlek</h3>
      <div class="flex gap-2">
        <div
          v-for="opt in textSizeOptions"
          :key="opt.id"
          class="flex-1 cursor-pointer rounded-md border transition-all select-none flex flex-col items-center justify-center gap-2 py-4 hover:bg-primary/5 hover:border-primary"
          :class="
            textSize === opt.id
              ? 'bg-primary/10 border-primary'
              : 'bg-card border-border'
          "
          @click="textSize = opt.id as any"
        >
          <LucideType
            :class="{
              'text-sm': opt.id === 'liten',
              'text-base': opt.id === 'standard',
              'text-xl': opt.id === 'stor',
            }"
          />
          <span class="text-sm font-normal">{{ opt.label }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="font-normal">Typsnitt</h3>
      <div class="flex gap-2">
        <div
          v-for="opt in fontOptions"
          :key="opt.id"
          class="flex-1 cursor-pointer rounded-md border transition-all select-none flex flex-col items-center justify-center gap-2 py-4 hover:bg-primary/5 hover:border-primary"
          :class="
            font === opt.id
              ? 'bg-primary/10 border-primary'
              : 'bg-card border-border'
          "
          @click="font = opt.id"
        >
          <span
            class="text-lg leading-none"
            :style="{ fontFamily: opt.family }"
          >{{ opt.preview }}</span>
          <span class="text-sm font-normal">{{ opt.label }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="font-normal">Tangentbordsgenvägar</h3>
      <div class="space-y-4">
        <div v-for="cat in categories" :key="cat.id" class="space-y-2">
          <h4 class="text-sm text-muted-foreground">{{ cat.label }}</h4>
          <div class="rounded-lg border bg-card">
            <table class="w-full">
              <tbody class="divide-y divide-border">
                <tr
                  v-for="s in shortcuts.filter((s) => s.category === cat.id)"
                  :key="s.action"
                  class="text-sm"
                >
                  <td class="px-4 py-3 text-foreground">{{ s.action }}</td>
                  <td class="px-4 py-3 text-right">
                    <kbd
                      class="inline-flex h-7 items-center rounded border bg-muted px-2 font-mono text-sm text-muted-foreground"
                    >
                      {{ s.key }}
                    </kbd>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
