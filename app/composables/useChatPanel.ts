import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import type { Ref } from "vue";
import { storeToRefs } from "pinia";
import {
  useChatStore,
  type ChatAttachment,
  type PendingSelection,
} from "@/stores/chat";
import { useChat } from "@/composables/useChat";

export interface ChatInputApi {
  focus: () => void;
  getShellTop: () => number | null;
  getText: () => string;
  setText: (value: string) => void;
  getAttachments: () => ChatAttachment[];
  setAttachments: (value: ChatAttachment[]) => void;
  clearAttachments: () => void;
  discardAttachments: () => void;
  addFiles: (files: File[]) => void;
}

export interface ChatTranscriptApi {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  restoreScroll: () => void;
  persistScrollPosition: () => void;
  resetScrollState: () => void;
}

export interface ChatPanelOptions {
  examId: string;
  examUrl: string;
  courseCode: string;
  solutionUrl?: string | null;
  input: Ref<ChatInputApi | null>;
  transcript: Ref<ChatTranscriptApi | null>;

  fixedModelId?: string;
}

export function useChatPanel(opts: ChatPanelOptions) {
  const chatStore = useChatStore();
  const user = useSupabaseUser();
  const { messages, isLoading, currentConversationTitle, isHistoryOpen } =
    storeToRefs(chatStore);

  const { selectedModelId } = useSelectedModel();
  const { webSearch } = useWebSearch();

  const { send, cancelGeneration } = useChat({
    examId: opts.examId,
    examUrl: opts.examUrl,
    courseCode: opts.courseCode,
    solutionUrl: opts.solutionUrl,
  });

  const selectionContext = ref("");

  const currentUserId = computed(
    () =>
      ((user.value as any)?.id ?? (user.value as any)?.sub ?? null) as
        | string
        | null,
  );

  const chatHeaderTitle = computed(() => {
    if (currentConversationTitle.value) return currentConversationTitle.value;

    const firstUserMessage = messages.value.find((msg) => msg.role === "user");
    if (firstUserMessage?.content) return firstUserMessage.content;

    return "Ny chatt";
  });

  async function submit(
    text: string,
    context?: string,
    attachments: ChatAttachment[] = [],
  ) {
    nextTick(() => opts.transcript.value?.scrollToBottom("smooth"));

    await send(text, attachments, {
      modelId: opts.fixedModelId ?? selectedModelId.value,
      selectionContext: context,
      webSearch: webSearch.value,
    });
  }

  async function handleSend() {
    const text = opts.input.value?.getText() ?? "";
    const attachments = opts.input.value?.getAttachments() ?? [];
    if ((!text.trim() && attachments.length === 0) || isLoading.value) return;
    const context = selectionContext.value || undefined;
    opts.input.value?.setText("");
    opts.input.value?.clearAttachments();
    selectionContext.value = "";

    await submit(text, context, attachments);
  }

  function handleCancel() {
    const cancelled = cancelGeneration();
    if (cancelled) {
      opts.input.value?.setText(cancelled.content);
      opts.input.value?.setAttachments(cancelled.attachments);
      opts.input.value?.focus();
    }
  }

  function handleReplyToSelection(text: string) {
    selectionContext.value = text;
    nextTick(() => opts.input.value?.focus());
  }

  function startPendingSelection(pending: PendingSelection) {
    if (isLoading.value) {
      selectionContext.value = pending.context;
      nextTick(() => {
        if (!opts.input.value?.getText().trim()) {
          opts.input.value?.setText(pending.prompt);
        }
        opts.input.value?.focus();
      });
      return;
    }

    submit(pending.prompt, pending.context);
  }

  function toggleHistory() {
    if (!chatStore.isOpen) return;
    isHistoryOpen.value = !isHistoryOpen.value;
  }

  function startNewChat() {
    chatStore.releaseMessageAttachmentPreviews();
    chatStore.messages = [];
    chatStore.draftInput = "";
    chatStore.draftAttachments = [];
    opts.input.value?.setText("");
    opts.input.value?.discardAttachments();
    chatStore.currentConversationId = null;
    chatStore.currentConversationTitle = null;
    chatStore.savedScrollPosition = 0;
    opts.transcript.value?.resetScrollState();
    chatStore.setLoading(false);
    isHistoryOpen.value = false;
    selectionContext.value = "";
    nextTick(() => opts.input.value?.focus());
  }

  watch(
    () => chatStore.currentConversationId,
    () => {
      chatStore.draftAttachments = [];
      opts.input.value?.discardAttachments();
      nextTick(() => opts.transcript.value?.scrollToBottom("auto"));
    },
  );

  watch(currentUserId, (nextId, prevId) => {
    if (prevId && !nextId) {
      chatStore.resetOnLogout();
      opts.input.value?.discardAttachments();
    }
  });

  onMounted(() => {
    const pending = chatStore.takePendingSelection();

    if (chatStore.currentExamId !== opts.examId) {
      chatStore.clearChat();
      chatStore.currentExamId = opts.examId;
      opts.input.value?.discardAttachments();
    }

    nextTick(() => opts.transcript.value?.restoreScroll());

    if (pending) startPendingSelection(pending);
  });

  watch(
    () => chatStore.pendingSelection,
    (pending) => {
      if (!pending) return;
      const taken = chatStore.takePendingSelection();
      if (taken) startPendingSelection(taken);
    },
  );

  onBeforeUnmount(() => {
    chatStore.draftInput = opts.input.value?.getText() ?? "";
    chatStore.draftAttachments = opts.input.value?.getAttachments() ?? [];
  });

  return {
    messages,
    isLoading,
    isHistoryOpen,
    selectionContext,
    chatHeaderTitle,
    selectedModelId,
    webSearch,
    submit,
    handleSend,
    handleCancel,
    handleReplyToSelection,
    toggleHistory,
    startNewChat,
  };
}
