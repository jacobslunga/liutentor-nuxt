<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from "reka-ui";
// Imported rather than auto-imported: the nav is a list, so the icon has to be
// bound through `:is`, and that needs the component itself, not a tag name.
import {
  Palette,
  BookOpenText,
  Sparkles,
  Keyboard,
  Info,
} from "lucide-vue-next";

withDefaults(
  defineProps<{
    /** For callers that open the overlay from their own menu item. */
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

// Every open starts on the first section. Reopening the overlay on whichever
// pane was last read is disorienting when the trigger is a plain cog.
watch(open, (isOpen) => {
  if (isOpen) activeSection.value = SECTIONS[0].id;
});
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button variant="ghost" size="icon-sm">
        <LucideSettings />
      </Button>
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="settings-overlay fixed inset-0 z-100 bg-background/60 backdrop-blur-sm" />

      <DialogContent class="settings-shell fixed inset-0 z-100 flex flex-col bg-background outline-none">
        <VisuallyHidden>
          <DialogDescription>Anpassa hur LiU Tentor beter sig.</DialogDescription>
        </VisuallyHidden>

        <header class="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <div class="flex items-center gap-2.5">
            <LogoIcon class="size-6 text-primary" />
            <DialogTitle class="text-base font-medium text-foreground">
              Inställningar
            </DialogTitle>
          </div>

          <DialogClose as-child>
            <Button variant="ghost" size="icon-sm">
              <LucideX />
              <span class="sr-only">Stäng</span>
            </Button>
          </DialogClose>
        </header>

        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
          <!-- Rail on desktop, a scrollable chip row above the content on
               narrow screens where a 16rem column would eat half the width. -->
          <nav
            class="shrink-0 gap-1 overflow-x-auto border-b p-3 lg:flex lg:w-60 lg:flex-col lg:overflow-x-visible lg:border-b-0 lg:border-r lg:p-4"
          >
            <div class="flex gap-1 lg:contents">
              <Button
                v-for="(section, i) in SECTIONS"
                :key="section.id"
                variant="ghost"
                class="settings-nav-item h-auto justify-start gap-2.5 rounded-xl px-3 py-2 text-sm lg:w-full"
                :class="
                  activeSection === section.id
                    ? 'bg-muted text-foreground hover:bg-muted'
                    : 'font-normal text-muted-foreground'
                "
                :style="{ '--nav-index': i }"
                @click="activeSection = section.id"
              >
                <component :is="section.icon" class="size-4 shrink-0" />
                {{ section.label }}
              </Button>
            </div>
          </nav>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
            <Transition name="settings-section" mode="out-in">
              <SettingsPanel :key="activeSection" :section="activeSection" />
            </Transition>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* The shell covers the whole viewport, so it cannot slide in from an edge
   without a visible empty band. It grows into place from just under full size
   instead, which reads as the page stepping forward rather than a panel
   arriving. */
.settings-shell[data-state="open"] {
  animation: settings-shell-in var(--duration-base) var(--ease-spring);
}

.settings-shell[data-state="closed"] {
  animation: settings-shell-out var(--duration-fast) var(--ease-spring);
}

@keyframes settings-shell-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(12px);
  }
}

@keyframes settings-shell-out {
  to {
    opacity: 0;
    transform: scale(0.99) translateY(6px);
  }
}

.settings-overlay[data-state="open"] {
  animation: settings-fade-in var(--duration-base) var(--ease-spring);
}

.settings-overlay[data-state="closed"] {
  animation: settings-fade-out var(--duration-fast) var(--ease-spring);
}

@keyframes settings-fade-in {
  from {
    opacity: 0;
  }
}

@keyframes settings-fade-out {
  to {
    opacity: 0;
  }
}

/* The rail arrives a beat after the shell, top item first. */
.settings-shell[data-state="open"] .settings-nav-item {
  animation: settings-nav-in var(--duration-base) var(--ease-spring) backwards;
  animation-delay: calc(80ms + var(--nav-index) * 30ms);
}

@keyframes settings-nav-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

/* Between sections: short enough that clicking through the rail never feels
   like waiting for the pane to catch up. */
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
  .settings-shell[data-state="open"],
  .settings-shell[data-state="closed"],
  .settings-shell[data-state="open"] .settings-nav-item {
    animation: none;
  }

  .settings-section-enter-active,
  .settings-section-leave-active {
    transition: none;
  }
}
</style>
