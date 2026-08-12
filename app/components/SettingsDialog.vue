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

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.5;
const SETTLE_MS = 240;
const SETTLE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

const dragY = ref(0);
const isDragging = ref(false);

const isDismissing = ref(false);
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

const sheetStyle = computed(() => {
  if (!isDragging.value && !dragY.value) return undefined;
  return {
    transform: `translateY(${dragY.value}px)`,
    transition: isDragging.value
      ? "none"
      : `transform ${SETTLE_MS}ms ${SETTLE_EASE}`,

    ...(isDismissing.value ? { animation: "none" } : {}),
  };
});

let activePointerId: number | null = null;
let startY = 0;
let lastY = 0;
let lastTime = 0;

let velocity = 0;

function detachPointer(el: HTMLElement) {
  el.removeEventListener("pointermove", onGrabberMove);
  el.removeEventListener("pointerup", onGrabberUp);
  el.removeEventListener("pointercancel", onGrabberUp);
  if (activePointerId !== null && el.hasPointerCapture?.(activePointerId)) {
    el.releasePointerCapture(activePointerId);
  }
  activePointerId = null;
}

function onGrabberDown(e: PointerEvent) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  const el = e.currentTarget as HTMLElement;
  activePointerId = e.pointerId;
  el.setPointerCapture(e.pointerId);

  isDragging.value = true;
  startY = e.clientY;
  lastY = e.clientY;
  lastTime = e.timeStamp;
  velocity = 0;

  el.addEventListener("pointermove", onGrabberMove);
  el.addEventListener("pointerup", onGrabberUp);
  el.addEventListener("pointercancel", onGrabberUp);
}

function onGrabberMove(e: PointerEvent) {
  if (e.pointerId !== activePointerId) return;

  dragY.value = Math.max(0, e.clientY - startY);

  const elapsed = e.timeStamp - lastTime;
  if (elapsed > 0) {
    velocity = (e.clientY - lastY) / elapsed;
    lastY = e.clientY;
    lastTime = e.timeStamp;
  }
}

function onGrabberUp(e: PointerEvent) {
  if (e.pointerId !== activePointerId) return;
  detachPointer(e.currentTarget as HTMLElement);
  isDragging.value = false;

  if (dragY.value > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {

    isDismissing.value = true;
    dragY.value = window.innerHeight;
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      open.value = false;
    }, SETTLE_MS);
    return;
  }

  dragY.value = 0;
}

onUnmounted(() => {
  if (dismissTimer) clearTimeout(dismissTimer);
});

watch(open, (isOpen) => {
  if (!isOpen) return;
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  activeSection.value = SECTIONS[0].id;
  dragY.value = 0;
  isDismissing.value = false;
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button variant="ghost" size="icon-sm">
        <LucideSettings />
      </Button>
    </DialogTrigger>

    <DialogContent :show-close-button="false" variant="sheet" :style="sheetStyle"
      class="flex h-[88dvh] w-full flex-col gap-0 overflow-hidden p-0 pb-[env(safe-area-inset-bottom,0px)] sm:h-[85vh] sm:max-h-[620px] sm:max-w-3xl sm:pb-0">
      <VisuallyHidden>
        <DialogDescription>Anpassa hur LiU Tentor beter sig.</DialogDescription>
      </VisuallyHidden>

      <div class="flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing sm:hidden"
        @pointerdown="onGrabberDown">
        <div class="h-1 w-9 rounded-full bg-muted-foreground/30" />
      </div>

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
