<script setup lang="ts">
const props = defineProps<{
  examPdfUrl: string;
  solutionPdfUrl: string | null;
}>();

const isFacitVisible = ref(false);
const isManual = ref(false);
const panelWidth = ref(
  typeof window !== "undefined" ? window.innerWidth / 2 : 600,
);
const isDragging = ref(false);
const panelRef = ref<HTMLDivElement | null>(null);

const hasFacit = computed(() => !!props.solutionPdfUrl);

function startResize() {
  isDragging.value = true;

  function onMouseMove(e: MouseEvent) {
    const newWidth = window.innerWidth - e.clientX;
    panelWidth.value = Math.max(
      300,
      Math.min(newWidth, window.innerWidth * 0.85),
    );
  }

  function onMouseUp() {
    isDragging.value = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!hasFacit.value || isManual.value || isDragging.value) return;

  const w = window.innerWidth;
  const threshold = w * 0.9;
  const topSafeZone = 120;
  const offset = 40;

  if (isFacitVisible.value && panelRef.value) {
    const rect = panelRef.value.getBoundingClientRect();
    const insideWithOffset =
      e.clientX >= rect.left - offset &&
      e.clientX <= rect.right + offset &&
      e.clientY >= rect.top - offset &&
      e.clientY <= rect.bottom + offset;
    if (insideWithOffset) return;
  }

  if (e.clientX > threshold) {
    if (!isFacitVisible.value && e.clientY < topSafeZone) return;
    isFacitVisible.value = true;
    return;
  }

  isFacitVisible.value = false;
}

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("keydown", handleKeyDown);
});

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "e" || e.key === "E") {
    isFacitVisible.value = !isFacitVisible.value;
    isManual.value = !isManual.value;
  }
  if (e.key === "Escape") {
    isManual.value = false;
    isFacitVisible.value = false;
  }
}
</script>

<template>
  <div
    class="w-full h-full relative bg-background"
    :class="{ 'select-none': isDragging }"
  >
    <div class="w-full h-full bg-background overflow-auto">
      <ClientOnly>
        <PdfRenderer :pdf-url="examPdfUrl" layout-mode="exam-only" />
      </ClientOnly>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-if="hasFacit && isFacitVisible"
        ref="panelRef"
        class="absolute right-0 top-0 h-full bg-background border-l shadow-2xl z-40 flex"
        :style="{ width: `${panelWidth}px` }"
      >
        <div class="relative w-0 shrink-0">
          <ResizeHandle :is-resizing="isDragging" @start-resize="startResize" />
        </div>
        <div class="flex-1 w-full h-full overflow-auto relative">
          <ClientOnly>
            <PdfRenderer :pdf-url="solutionPdfUrl!" layout-mode="exam-only" />
          </ClientOnly>
        </div>
      </div>
    </Transition>

    <GradientIndicator
      v-if="hasFacit && !isFacitVisible"
      :facit-pdf-url="solutionPdfUrl"
    />
  </div>
</template>
