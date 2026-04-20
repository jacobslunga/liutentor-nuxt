import { ref } from "vue";
import { useChatStore } from "@/stores/chat";

const CHAT_API_URL =
  "https://liutentor-api-production.up.railway.app/api/v1/chat/completion";

// USE FOR LOCAL DEVELOPMENT
// const CHAT_API_URL_LOCAL = "http://localhost:3001/api/v1/chat/completion";

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

  function cancelGeneration(): string | null {
    abortController.value?.abort();
    abortController.value = null;

    let cancelledUserMessage: string | null = null;
    const msgs = chatStore.messages;
    const last = msgs[msgs.length - 1];

    if (last?.role === "assistant") {
      if (!last.content.trim()) {
        const userMsg = msgs[msgs.length - 2];
        if (userMsg?.role === "user") cancelledUserMessage = userMsg.content;

        if (msgs.length === 2) {
          chatStore.messages = [
            ...msgs.slice(0, -1),
            { role: "assistant", content: "> *Avbruten av användaren*" },
          ];
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
    opts: {
      giveDirectAnswer?: boolean;
      modelId?: string;
      context?: string;
    } = {},
  ) {
    if (!content.trim() || chatStore.isLoading) return;

    const trimmedContent = content.trim();
    const userId = getUserId();

    if (!chatStore.currentConversationTitle) {
      chatStore.currentConversationTitle = trimmedContent.substring(0, 80);
    }

    if (userId && !chatStore.currentConversationId) {
      try {
        const title = trimmedContent.substring(0, 50);
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

    const {
      giveDirectAnswer = true,
      modelId = "gemini-2.5-pro",
      context,
    } = opts;

    const userMessage = {
      role: "user" as const,
      content,
      ...(context ? { context } : {}),
    };

    chatStore.messages.push(userMessage);
    chatStore.messages.push({ role: "assistant", content: "" });
    chatStore.setLoading(true);

    abortController.value = new AbortController();

    try {
      const recentMessages = chatStore.messages
        .slice(0, -1)
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.context ? { context: m.context } : {}),
        }));

      const authHeaders = await getAuthHeaders();

      const response = await fetch(`${CHAT_API_URL}/${options.examId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-user-id": getAnonymousId(),
          ...authHeaders,
        },
        body: JSON.stringify({
          messages: recentMessages,
          giveDirectAnswer,
          examUrl: options.examUrl,
          courseCode: options.courseCode,
          solutionUrl: options.solutionUrl || undefined,
          modelId,
          conversationId: chatStore.currentConversationId,
        }),
        signal: abortController.value.signal,
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let streamText = "";
      let lastUpdate = 0;
      const STREAM_UPDATE_INTERVAL = 50;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamText += decoder.decode(value, { stream: true });
        const now = Date.now();

        if (now - lastUpdate >= STREAM_UPDATE_INTERVAL) {
          lastUpdate = now;
          const updated = [...chatStore.messages];
          updated[updated.length - 1] = {
            role: "assistant",
            content: streamText,
          };
          chatStore.messages = updated;
        }
      }

      const final = [...chatStore.messages];
      final[final.length - 1] = {
        role: "assistant",
        content: streamText.trim() || "Jag kunde inte generera ett svar.",
      };
      chatStore.messages = final;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;

      const updated = [...chatStore.messages];
      updated[updated.length - 1] = {
        role: "assistant",
        content: "Något gick fel. Försök igen senare.",
      };
      chatStore.messages = updated;
    } finally {
      abortController.value = null;
      chatStore.setLoading(false);
    }
  }

  return { send, cancelGeneration };
}
