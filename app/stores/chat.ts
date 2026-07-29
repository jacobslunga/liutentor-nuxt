import { defineStore } from "pinia";
import { ref } from "vue";

export interface Message {
  role: "user" | "assistant";
  content: string;
  context?: string;
  selectionContext?: string;
}

/** A question asked about text selected outside the chat, e.g. in a PDF. */
export interface PendingSelection {
  /** Sent verbatim as the user message. */
  prompt: string;
  /** The highlighted text, quoted above that message. */
  context: string;
}

export const useChatStore = defineStore("chat", () => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const savedScrollPosition = ref(0);
  const messages = ref<Message[]>([]);
  const draftInput = ref("");
  const currentExamId = ref<string | null>(null);
  const currentConversationId = ref<string | null>(null);
  const currentConversationTitle = ref<string | null>(null);
  const isHistoryOpen = ref(false);
  const pendingSelection = ref<PendingSelection | null>(null);

  /**
   * Open the chat with a question about text selected elsewhere. The payload
   * waits in the store because the panel is mounted lazily — on the first ask
   * there is no ChatWindow yet to hand it to.
   */
  function askAboutSelection(prompt: string, context: string) {
    pendingSelection.value = { prompt, context };
    isOpen.value = true;
  }

  /**
   * Read-and-clear, so the ask is consumed exactly once no matter whether the
   * panel picked it up on mount or through its watcher.
   */
  function takePendingSelection(): PendingSelection | null {
    const pending = pendingSelection.value;
    pendingSelection.value = null;
    return pending;
  }

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
    currentConversationTitle.value = null;
    isHistoryOpen.value = false;
    pendingSelection.value = null;
  }

  function resetOnLogout() {
    clearChat();
    isOpen.value = false;
  }

  return {
    isOpen,
    isLoading,
    messages,
    savedScrollPosition,
    draftInput,
    currentExamId,
    currentConversationId,
    currentConversationTitle,
    isHistoryOpen,
    pendingSelection,
    askAboutSelection,
    takePendingSelection,
    toggle,
    open,
    close,
    setLoading,
    clearChat,
    resetOnLogout,
  };
});
