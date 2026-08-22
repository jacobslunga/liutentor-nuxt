import { ref } from "vue";
import { useChatStore, type ChatAttachment } from "@/stores/chat";

const CHAT_API_URL =
  "https://liutentor-hono-687405545415.europe-north2.run.app/api/v1/chat/completion";

// const CHAT_API_URL_LOCAL = "http://localhost:8080/api/v1/chat/completion";

const DEFAULT_MODEL_ID = "gemini-3.1-flash-lite";

function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;

  return `${title.slice(0, maxLength - 1).trimEnd()}…`;
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return "unknown";
  const key = "liutentor_anonymous_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export function useChat(options: {
  examId: string | number;
  examUrl: string;
  courseCode: string;
  solutionUrl?: string | null;
}) {
  const chatStore = useChatStore();
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const { getAuthHeaders } = useAuthHeaders();
  const abortController = ref<AbortController | null>(null);

  function getUserId(): string | null {
    return ((user.value as any)?.id ?? (user.value as any)?.sub ?? null) as
      | string
      | null;
  }

  function cancelGeneration(): {
    content: string;
    attachments: ChatAttachment[];
  } | null {
    abortController.value?.abort();
    abortController.value = null;

    let cancelledUserMessage: {
      content: string;
      attachments: ChatAttachment[];
    } | null = null;
    const msgs = chatStore.messages;
    const last = msgs[msgs.length - 1];

    if (last?.role === "assistant") {
      if (!last.content.trim()) {
        const userMsg = msgs[msgs.length - 2];
        if (userMsg?.role === "user") {
          cancelledUserMessage = {
            content: userMsg.content,
            attachments: userMsg.attachments ?? [],
          };
        }

        if (msgs.length === 2) {
          chatStore.messages = [
            ...msgs.slice(0, -1),
            { role: "assistant", content: "> *Avbruten av användaren*" },
          ];
          cancelledUserMessage = null;
        } else {
          chatStore.messages = msgs.slice(0, -2);
        }
      } else {
        chatStore.messages = [
          ...msgs.slice(0, -1),
          {
            role: "assistant",
            content: last.content.trim() + "\n\n> *Avbruten av användaren*",
          },
        ];
      }
    }

    chatStore.setLoading(false);
    return cancelledUserMessage;
  }

  async function send(
    content: string,
    attachments: ChatAttachment[] = [],
    opts: {
      modelId?: string;
      context?: string;
      selectionContext?: string;
    } = {},
  ) {
    if ((!content.trim() && attachments.length === 0) || chatStore.isLoading) {
      return;
    }

    const trimmedContent = content.trim();
    const userId = getUserId();

    if (!chatStore.currentConversationTitle) {
      chatStore.currentConversationTitle =
        truncateTitle(trimmedContent, 80) ||
        (attachments[0]?.name
          ? truncateTitle(attachments[0].name, 80)
          : "Ny chatt");
    }

    if (userId && !chatStore.currentConversationId) {
      try {
        const title =
          truncateTitle(trimmedContent, 50) ||
          (attachments[0]?.name
            ? truncateTitle(attachments[0].name, 50)
            : "Ny chatt");
        const { data, error } = await (supabase as any)
          .from("conversations")
          .insert({
            user_id: userId,
            title,
          })
          .select("id")
          .single();

        if (error) throw error;
        chatStore.currentConversationId = data.id;
        chatStore.currentConversationTitle = title;
      } catch (e) {
        console.error("Failed to initialize conversation history:", e);
      }
    }

    const { modelId = DEFAULT_MODEL_ID, context, selectionContext } = opts;
    const resolvedModelId = modelId || DEFAULT_MODEL_ID;

    const userMessage = {
      role: "user" as const,
      content,
      ...(context ? { context } : {}),
      ...(selectionContext ? { selectionContext } : {}),
      ...(attachments.length ? { attachments } : {}),
    };

    chatStore.messages.push(userMessage);
    chatStore.messages.push({ role: "assistant", content: "" });
    chatStore.setLoading(true);

    const controller = new AbortController();
    abortController.value = controller;

    let pendingFrame = 0;

    const cancelPendingFlush = () => {
      if (pendingFrame) {
        cancelAnimationFrame(pendingFrame);
        pendingFrame = 0;
      }
    };

    try {
      const recentMessages = chatStore.messages
        .slice(0, -1)
        .slice(-20)
        .map((m) => ({
          role: m.role,
          content:
            m.role === "user" && !m.content.trim() && m.attachments?.length
              ? "Jag bifogade material till den här frågan."
              : m.content,
          ...(m.context ? { context: m.context } : {}),
        }));

      const authHeaders = await getAuthHeaders();

      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify({
          messages: recentMessages,
          examUrl: options.examUrl,
          courseCode: options.courseCode,
          solutionUrl: options.solutionUrl || undefined,
          modelId: resolvedModelId,
          conversationId: chatStore.currentConversationId,
          selectionContext: selectionContext || undefined,
        }),
      );
      for (const attachment of chatStore.getActiveAttachments()) {
        if (attachment.file) {
          formData.append("files", attachment.file, attachment.name);
        }
      }

      const response = await fetch(`${CHAT_API_URL}/${options.examId}`, {
        method: "POST",
        headers: {
          "x-anonymous-user-id": getAnonymousId(),
          ...authHeaders,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let streamText = "";

      const writeStreamText = (text: string) => {
        const msgs = chatStore.messages;
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") last.content = text;
      };

      const flush = () => {
        pendingFrame = 0;
        if (controller.signal.aborted) return;
        writeStreamText(streamText);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamText += decoder.decode(value, { stream: true });
        if (!pendingFrame) pendingFrame = requestAnimationFrame(flush);
      }

      cancelPendingFlush();
      writeStreamText(streamText.trim() || "Jag kunde inte generera ett svar.");
    } catch (error) {
      cancelPendingFlush();
      if (error instanceof Error && error.name === "AbortError") return;

      const msgs = chatStore.messages;
      const last = msgs[msgs.length - 1];
      if (last?.role === "assistant") {
        last.content = "Något gick fel. Försök igen senare.";
      }
    } finally {
      cancelPendingFlush();
      abortController.value = null;
      chatStore.setLoading(false);
    }
  }

  return { send, cancelGeneration };
}
