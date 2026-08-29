<script setup lang="ts">
import { VisuallyHidden } from "reka-ui";

import {
  Palette,
  BookOpenText,
  Sparkles,
  Keyboard,
  Info,
} from "lucide-vue-next";

withDefaults(
  defineProps<{

    hideTrigger?: boolean;
  }>(),
  { hideTrigger: false },
);

const open = defineModel<boolean>("open", { default: false });

const SECTIONS = [
  { id: "appearance", label: "Utseende", icon: Palette },
  { id: "reading", label: "Läsvy", icon: BookOpenText },
  { id: "ai", label: "AI-assistenten", icon: Sparkles },
  { id: "shortcuts", label: "Genvägar", icon: Keyboard },
  { id: "fixed", label: "Fasta gränser", icon: Info },
] as const;

const activeSection = ref<string>(SECTIONS[0].id);

watch(open, (isOpen) => {
  if (isOpen) activeSection.value = SECTIONS[0].id;
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button variant="ghost" size="icon-sm">
        <LucideSettings />
      </Button>
    </DialogTrigger>

    <DialogContent :show-close-button="false"
      class="flex h-[85dvh] max-h-[620px] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
      <VisuallyHidden>
        <DialogDescription>Anpassa hur LiU Tentor beter sig.</DialogDescription>
      </VisuallyHidden>

      <div class="flex min-h-0 flex-1">

        <aside class="hidden w-56 shrink-0 flex-col border-r bg-muted/40 p-3 lg:flex">
          <DialogTitle class="px-3 pt-2 pb-3 text-xs font-medium tracking-wide text-muted-foreground">
            Inställningar
          </DialogTitle>

          <nav class="flex flex-col gap-0.5">
            <Button v-for="section in SECTIONS" :key="section.id" variant="ghost"
              class="h-auto w-full justify-start gap-2.5 px-3 py-2 text-sm" :class="activeSection === section.id
                  ? 'bg-background text-foreground shadow-xs hover:bg-background'
                  : 'font-normal text-muted-foreground hover:bg-background/60'
                " @click="activeSection = section.id">
              <component :is="section.icon" class="size-4 shrink-0" />
              {{ section.label }}
            </Button>
          </nav>
        </aside>

        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
          <div class="flex shrink-0 items-start gap-2 p-3 lg:justify-end lg:p-2">
            <nav class="custom-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto lg:hidden">
              <Button v-for="section in SECTIONS" :key="section.id" variant="ghost"
                class="h-auto shrink-0 gap-2 px-3 py-1.5 text-sm" :class="activeSection === section.id
                    ? 'bg-muted text-foreground hover:bg-muted'
                    : 'font-normal text-muted-foreground'
                  " @click="activeSection = section.id">
                <component :is="section.icon" class="size-4 shrink-0" />
                {{ section.label }}
              </Button>
            </nav>

            <DialogClose as-child>
              <Button variant="ghost" size="icon-sm" class="shrink-0 text-muted-foreground">
                <LucideX />
                <span class="sr-only">Stäng</span>
              </Button>
            </DialogClose>
          </div>

          <div class="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-1 pb-8 sm:px-8">
            <Transition name="settings-section" mode="out-in">
              <SettingsPanel :key="activeSection" :section="activeSection" />
            </Transition>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

.settings-section-enter-active,
.settings-section-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-spring),
    transform var(--duration-fast) var(--ease-spring);
}

.settings-section-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.settings-section-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {

  .settings-section-enter-active,
  .settings-section-leave-active {
    transition: none;
  }
}
</style>
