import { useChatStore } from "@/stores/chat";

export function useHeaderVisibility(blockCondition?: () => boolean) {
  const chatStore = useChatStore();
  const isVisible = ref(true);
  const isHovering = ref(false);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  const startHideTimer = () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isHovering.value && (!blockCondition || !blockCondition())) {
        isVisible.value = false;
      }
    }, 2500);
  };

  const handleMouseMove = () => {
    isVisible.value = true;
    startHideTimer();
  };

  watch(
    () => chatStore.isOpen,
    (open) => {
      isVisible.value = !open;
      if (open && hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    },
  );

  onMounted(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    startHideTimer();
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    if (hideTimer) clearTimeout(hideTimer);
  });

  return { isVisible, isHovering, startHideTimer };
}
