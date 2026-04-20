<script setup lang="ts">
import ChatWindow from "./ChatWindow.vue";
const props = defineProps<{
  examPdfUrl: string;
  solutionPdfUrl: string | null;
}>();

const chatStore = useChatStore();
const route = useRoute();

const isFacitVisible = ref(false);
const isManual = ref(false);
const isDragging = ref(false);
const panelRef = ref<HTMLDivElement | null>(null);

const panelWidth = ref(
  typeof window !== "undefined" ? window.innerWidth / 2 : 600,
);
const hasFacit = computed(() => !!props.solutionPdfUrl);

watch(
  () => chatStore.isOpen,
  (open) => {
    if (open) {
      isFacitVisible.value = false;
      isManual.value = false;
    }
  },
);

function startResize() {
  isDragging.value = true;
  const onMouseMove = (e: MouseEvent) => {
    const newWidth = window.innerWidth - e.clientX;
    panelWidth.value = Math.max(
      300,
      Math.min(newWidth, window.innerWidth * 0.85),
    );
  };
  const onMouseUp = () => {
    isDragging.value = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!hasFacit.value || isManual.value || isDragging.value || chatStore.isOpen)
    return;

  if (!isFacitVisible.value && e.clientY < 80) return;

  const w = window.innerWidth;
  const threshold = w * 0.92;
  const offset = 40;

  if (isFacitVisible.value && panelRef.value) {
    const rect = panelRef.value.getBoundingClientRect();
    const isInside =
      e.clientX >= rect.left - offset && e.clientY >= rect.top - offset;
    if (isInside) return;
  }

  if (e.clientX > threshold) {
    isFacitVisible.value = true;
  } else {
    isFacitVisible.value = false;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.defaultPrevented) return;

  if (e.key.toLowerCase() === "e") {
    if (chatStore.isOpen) return;
    isFacitVisible.value = !isFacitVisible.value;
    isManual.value = isFacitVisible.value;
  }
  if (e.key === "Escape") {
    if (chatStore.isOpen && chatStore.isHistoryOpen) {
      e.preventDefault();
      chatStore.isHistoryOpen = false;
      return;
    }

    isManual.value = false;
    isFacitVisible.value = false;
    chatStore.close();
  }
}

const chatWindowRef = ref<InstanceType<typeof ChatWindow> | null>(null);

function focusChat() {
  chatWindowRef.value?.focusInput();
}

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("keydown", handleKeyDown);
});

const chatHasBeenOpened = ref(false);

watch(
  () => chatStore.isOpen,
  (open) => {
    if (open) {
      isFacitVisible.value = false;
      isManual.value = false;
      if (!chatHasBeenOpened.value) chatHasBeenOpened.value = true;
      nextTick(() => focusChat());
    }
  },
);
</script>

<template>
  <div
    class="w-full h-screen relative bg-background overflow-hidden"
    :class="{ 'select-none': isDragging }"
  >
    <div class="absolute inset-0 z-0">
      <ClientOnly>
        <PdfRenderer :pdf-url="examPdfUrl" layout-mode="exam-only" />
      </ClientOnly>
    </div>

    <GradientIndicator
      v-if="hasFacit && !isFacitVisible && !chatStore.isOpen"
      :facit-pdf-url="solutionPdfUrl"
    />
  </div>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
      enter-from-class="translate-x-full opacity-0 blur-sm"
      enter-to-class="translate-x-0 opacity-100 blur-0"
      leave-active-class="transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
      leave-from-class="translate-x-0 opacity-100 blur-0"
      leave-to-class="translate-x-full opacity-0 blur-sm"
    >
      <div
        v-show="hasFacit && isFacitVisible && !chatStore.isOpen"
        ref="panelRef"
        class="fixed right-0 top-0 h-full bg-background border-l shadow-2xl z-60 flex"
        :style="{ width: `${panelWidth}px` }"
      >
        <div class="relative w-0 shrink-0">
          <ResizeHandle :is-resizing="isDragging" @start-resize="startResize" />
        </div>
        <div class="flex-1 overflow-hidden">
          <ClientOnly>
            <PdfRenderer :pdf-url="solutionPdfUrl!" layout-mode="exam-only" />
          </ClientOnly>
        </div>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
      enter-from-class="translate-x-full opacity-0 blur-sm"
      enter-to-class="translate-x-0 opacity-100 blur-0"
      leave-active-class="transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
      leave-from-class="translate-x-0 opacity-100 blur-0"
      leave-to-class="translate-x-full opacity-0 blur-sm"
    >
      <div
        v-if="chatHasBeenOpened"
        v-show="chatStore.isOpen"
        class="fixed right-0 top-0 h-full bg-background border-l shadow-2xl z-60 flex"
        :style="{ width: `${panelWidth}px` }"
      >
        <div class="relative w-0 shrink-0">
          <ResizeHandle :is-resizing="isDragging" @start-resize="startResize" />
        </div>
        <div class="flex-1 overflow-hidden">
          <ChatWindow
            ref="chatWindowRef"
            :exam-id="String(route.params.examId)"
            :exam-url="examPdfUrl"
            :course-code="String(route.params.courseCode)"
            :solution-url="solutionPdfUrl"
            :has-solution="hasFacit"
            class="h-full w-full"
            @close="chatStore.close()"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
