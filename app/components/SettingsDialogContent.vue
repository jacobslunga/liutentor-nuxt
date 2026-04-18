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
