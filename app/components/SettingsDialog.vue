<script setup lang="ts">
withDefaults(defineProps<{ hideTrigger?: boolean }>(), { hideTrigger: false });

const open = defineModel<boolean>("open", { default: false });

let overlayTouch: { id: number; x: number; y: number } | null = null;

function handleOverlayTouchStart(event: TouchEvent) {
  overlayTouch = null;
  if (!open.value || event.touches.length !== 1 ||
    !(event.target instanceof HTMLElement) ||
    !event.target.classList.contains("settings-dialog-overlay")) return;

  const touch = event.touches[0]!;
  overlayTouch = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
}

function handleOverlayTouchEnd(event: TouchEvent) {
  const start = overlayTouch;
  overlayTouch = null;
  if (!start || !open.value || !(event.target instanceof HTMLElement) ||
    !event.target.classList.contains("settings-dialog-overlay")) return;

  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
  if (!touch || Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10) return;

  // Safari can suppress the click that the modal's outside-touch handler awaits.
  // Consume this tap so it cannot activate the page after closing the modal.
  event.preventDefault();
  open.value = false;
}

function clearOverlayTouch() {
  overlayTouch = null;
}

onMounted(() => {
  document.addEventListener("touchstart", handleOverlayTouchStart, { passive: true });
  document.addEventListener("touchend", handleOverlayTouchEnd, { passive: false });
  document.addEventListener("touchcancel", clearOverlayTouch);
});

onUnmounted(() => {
  document.removeEventListener("touchstart", handleOverlayTouchStart);
  document.removeEventListener("touchend", handleOverlayTouchEnd);
  document.removeEventListener("touchcancel", clearOverlayTouch);
});
</script>

<template>
  <UModal
    v-model:open="open"
    title="Inställningar"
    description="Anpassa hur LiU Tentor beter sig."
    :ui="{
      overlay: 'settings-dialog-overlay',
      content: 'max-h-[min(640px,calc(100dvh-2rem))] sm:max-h-[min(640px,calc(100dvh-4rem))]',
      wrapper: 'flex flex-col gap-0.5',
      description: '!mt-0',
      body: 'min-h-0 overflow-y-auto px-4 py-4 sm:px-6',
    }"
  >
    <template v-if="!hideTrigger" #default>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-settings"
        aria-label="Inställningar"
      />
    </template>

    <template #body>
      <SettingsDialogContent />
    </template>
  </UModal>
</template>
