import { defineStore } from "pinia";
import { ref } from "vue";

export interface MessageSource {
  title: string;
  url: string;
}

export interface MessageStatus {
  step: string;
  message: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  context?: string;
  selectionContext?: string;
  attachments?: ChatAttachment[];
  /**
   * What the assistant is doing right now, e.g. searching the web. Live only for
   * the turn being streamed; history reloads from `ai_chat_logs` never carry it.
   */
  status?: MessageStatus | null;
  sources?: MessageSource[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  mediaType: string;
  size: number;
  lastModified: number;
  active: boolean;
  file?: File;
  previewUrl?: string;
}

export interface PendingSelection {

  prompt: string;

  context: string;
}

export const useChatStore = defineStore("chat", () => {
  const isOpen = ref(false);
  const isLoading = ref(false);
  const savedScrollPosition = ref(0);
  const messages = ref<Message[]>([]);
  const draftInput = ref("");
  const draftAttachments = ref<ChatAttachment[]>([]);
  const currentExamId = ref<string | null>(null);
  const currentConversationId = ref<string | null>(null);
  const currentConversationTitle = ref<string | null>(null);
  const isHistoryOpen = ref(false);
  const pendingSelection = ref<PendingSelection | null>(null);

  function askAboutSelection(prompt: string, context: string) {
    pendingSelection.value = { prompt, context };
    isOpen.value = true;
  }

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

  function getActiveAttachments(): ChatAttachment[] {
    return messages.value.flatMap((message) =>
      (message.attachments ?? []).filter(
        (attachment) => attachment.active && attachment.file,
      ),
    );
  }

  function deactivateAttachment(id: string) {
    for (const message of messages.value) {
      const attachment = message.attachments?.find((item) => item.id === id);
      if (!attachment) continue;
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      attachment.active = false;
      attachment.file = undefined;
      attachment.previewUrl = undefined;
      return;
    }
  }

  function releaseMessageAttachmentPreviews() {
    const previewUrls = new Set(
      messages.value
        .flatMap((message) => message.attachments ?? [])
        .map((attachment) => attachment.previewUrl)
        .filter((url): url is string => !!url),
    );
    for (const url of previewUrls) URL.revokeObjectURL(url);
  }

  function clearChat() {
    releaseMessageAttachmentPreviews();
    const previewUrls = new Set(
      draftAttachments.value
        .map((attachment) => attachment.previewUrl)
        .filter((url): url is string => !!url),
    );
    for (const url of previewUrls) URL.revokeObjectURL(url);
    messages.value = [];
    isLoading.value = false;
    savedScrollPosition.value = 0;
    draftInput.value = "";
    draftAttachments.value = [];
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
    draftAttachments,
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
    getActiveAttachments,
    deactivateAttachment,
    releaseMessageAttachmentPreviews,
    clearChat,
    resetOnLogout,
  };
});
