import { defineStore } from "pinia";
import { ref } from "vue";

export interface Message {
  role: "user" | "assistant";
  content: string;
  context?: string;
}

export const useChatStore = defineStore("chat", () => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const savedScrollPosition = ref(0);
  const messages = ref<Message[]>([]);
  const draftInput = ref("");
  const currentExamId = ref<string | null>(null);
  const currentConversationId = ref<string | null>(null);

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function setLoading(val: boolean) {
    isLoading.value = val;
  }

  function clearChat() {
    messages.value = [];
    isLoading.value = false;
    savedScrollPosition.value = 0;
    draftInput.value = "";
    currentExamId.value = null;
    currentConversationId.value = null;
  }

  return {
    isOpen,
    isLoading,
    messages,
    savedScrollPosition,
    draftInput,
    currentExamId,
    currentConversationId,
    toggle,
    open,
    close,
    setLoading,
    clearChat,
  };
});
