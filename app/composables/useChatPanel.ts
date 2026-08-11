import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import type { Ref } from "vue";
import { storeToRefs } from "pinia";
import { useChatStore, type PendingSelection } from "@/stores/chat";
import { useChat } from "@/composables/useChat";

/** The slice of ChatInput's exposed API this composable drives. */
export interface ChatInputApi {
  focus: () => void;
  getText: () => string;
  setText: (value: string) => void;
}

/** The slice of ChatMessages' exposed API this composable drives. */
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
  /**
   * Pin the model / answer mode for a shell that offers no pickers. Set rather
   * than written through the cookies on purpose: those are shared with the
   * desktop panel, and a phone session should not silently rewrite what the
   * reader chose there.
   */
  fixedModelId?: string;
  fixedDirectAnswer?: boolean;
}

/**
 * Everything a chat shell does that is not layout: sending, cancelling,
 * starting over, and picking up questions asked from outside the panel.
 *
 * Shared by the desktop side panel (ChatWindow) and the mobile bottom sheet
 * (MobileChatSheet), which differ only in how they present the same three
 * parts — header, transcript, input.
 */
export function useChatPanel(opts: ChatPanelOptions) {
  const chatStore = useChatStore();
  const user = useSupabaseUser();
  const { messages, isLoading, currentConversationTitle, isHistoryOpen } =
    storeToRefs(chatStore);

  const { giveDirectAnswer } = useAnswerMode();
  const { selectedModelId } = useSelectedModel();

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

  async function submit(text: string, context?: string) {
    nextTick(() => opts.transcript.value?.scrollToBottom("smooth"));

    await send(text, {
      modelId: opts.fixedModelId ?? selectedModelId.value,
      selectionContext: context,
      giveDirectAnswer: opts.fixedDirectAnswer ?? giveDirectAnswer.value,
    });
  }

  async function handleSend() {
    const text = opts.input.value?.getText() ?? "";
    if (!text.trim() || isLoading.value) return;
    const context = selectionContext.value || undefined;
    opts.input.value?.setText("");
    selectionContext.value = "";

    await submit(text, context);
  }

  function handleCancel() {
    const cancelled = cancelGeneration();
    if (cancelled) {
      opts.input.value?.setText(cancelled);
      opts.input.value?.focus();
    }
  }

  /** A selection made inside an answer, quoted back into the next question. */
  function handleReplyToSelection(text: string) {
    selectionContext.value = text;
    nextTick(() => opts.input.value?.focus());
  }

  /**
   * A question asked from outside the panel — today the PDF's "Förklara" button.
   * The quote goes over as selection context, exactly as a reply typed in here
   * would.
   */
  function startPendingSelection(pending: PendingSelection) {
    // Mid-generation the send would be dropped on the floor. Park the quote in
    // the input instead and let the reader fire it when the answer lands.
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
    chatStore.messages = [];
    chatStore.draftInput = "";
    opts.input.value?.setText("");
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
      nextTick(() => opts.transcript.value?.scrollToBottom("auto"));
    },
  );

  watch(currentUserId, (nextId, prevId) => {
    if (prevId && !nextId) {
      chatStore.resetOnLogout();
    }
  });

  onMounted(() => {
    // Read before the reset below, which clears the pending ask along with the
    // rest of the chat state. On the first ask this panel is mounted *by* that
    // ask, so the payload has to survive the mount.
    const pending = chatStore.takePendingSelection();

    if (chatStore.currentExamId !== opts.examId) {
      chatStore.clearChat();
      chatStore.currentExamId = opts.examId;
    }

    nextTick(() => opts.transcript.value?.restoreScroll());

    // After the scroll restore is queued, so its "auto" jump does not land on
    // top of the smooth scroll this send starts.
    if (pending) startPendingSelection(pending);
  });

  // Asks that arrive while the panel is already mounted, open or not.
  watch(
    () => chatStore.pendingSelection,
    (pending) => {
      if (!pending) return;
      const taken = chatStore.takePendingSelection();
      if (taken) startPendingSelection(taken);
    },
  );

  // Children are still mounted during onBeforeUnmount, so the draft can still
  // be read off the input. It is the only point the store needs to hear about it.
  onBeforeUnmount(() => {
    chatStore.draftInput = opts.input.value?.getText() ?? "";
  });

  return {
    messages,
    isLoading,
    isHistoryOpen,
    selectionContext,
    chatHeaderTitle,
    giveDirectAnswer,
    selectedModelId,
    submit,
    handleSend,
    handleCancel,
    handleReplyToSelection,
    toggleHistory,
    startNewChat,
  };
}
