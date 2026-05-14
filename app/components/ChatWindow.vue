<script setup lang="ts">
import {
  ref,
  shallowRef,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";
import { storeToRefs } from "pinia";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import katex from "katex";
import DOMPurify from "dompurify";
import { getShikiHighlighter } from "#imports";
import { useChatStore } from "@/stores/chat";
import { useChat } from "@/composables/useChat";

const props = defineProps<{
  examId: string;
  examUrl: string;
  courseCode: string;
  solutionUrl?: string | null;
  hasSolution: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const chatStore = useChatStore();
const user = useSupabaseUser();
const {
  isOpen,
  messages,
  isLoading,
  draftInput,
  currentConversationTitle,
  isHistoryOpen,
} = storeToRefs(chatStore);

const currentUserId = computed(
  () =>
    ((user.value as any)?.id ?? (user.value as any)?.sub ?? null) as
      | string
      | null,
);

const { send, cancelGeneration } = useChat({
  examId: props.examId,
  examUrl: props.examUrl,
  courseCode: props.courseCode,
  solutionUrl: props.solutionUrl,
});

DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName === "style") {
    data.forceKeepAttr = true;
  }
});

const md = shallowRef<MarkdownIt | null>(null);
const mdReady = ref(false);

const MAX_RENDER_CACHE = 200;
const renderCache = new Map<string, string>();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function initMarkdown() {
  const instance = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  instance.use(texmath, {
    engine: katex,
    delimiters: ["dollars", "brackets"],
    katexOptions: {
      throwOnError: false,
      errorColor: "inherit",
      strict: "ignore",
    },
  });

  const highlighter = await getShikiHighlighter();
  const loadedLangs = new Set(highlighter.getLoadedLanguages());

  instance.options.highlight = (code, lang) => {
    const language = lang && loadedLangs.has(lang as never) ? lang : "text";
    try {
      return highlighter.highlight(code, {
        lang: language,
        themes: {
          light: "one-light",
          dark: "one-dark-pro",
        },
        defaultColor: false,
      });
    } catch {
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    }
  };

  md.value = instance;
  mdReady.value = true;
  renderCache.clear();
}

initMarkdown();

function renderMarkdown(content: string): string {
  if (!md.value) return "";
  const normalized = content;
  return DOMPurify.sanitize(md.value.render(normalized), {
    ADD_TAGS: [
      "math",
      "semantics",
      "mrow",
      "mi",
      "mo",
      "mn",
      "msup",
      "msub",
      "mfrac",
      "mover",
      "munder",
      "mtext",
      "annotation",
    ],
    ADD_ATTR: ["xmlns", "encoding", "style", "class"],
  });
}

function getCachedMarkdown(content: string): string {
  const cached = renderCache.get(content);
  if (cached) return cached;

  const rendered = renderMarkdown(content);
  if (!rendered) return "";

  renderCache.set(content, rendered);

  if (renderCache.size > MAX_RENDER_CACHE) {
    const oldestKey = renderCache.keys().next().value;
    if (oldestKey) renderCache.delete(oldestKey);
  }

  return rendered;
}

const giveDirectAnswer = ref(true);
const { selectedModelId } = useSelectedModel();
const messagesContainer = ref<HTMLDivElement | null>(null);
const chatInputRef = ref<{ focus: () => void } | null>(null);
const isUserScrolling = ref(false);
const isAtBottom = ref(true);
const showScrollButton = ref(false);

const chatHeaderTitle = computed(() => {
  if (currentConversationTitle.value) return currentConversationTitle.value;

  const firstUserMessage = messages.value.find((msg) => msg.role === "user");
  if (firstUserMessage?.content) return firstUserMessage.content;

  return "Ny chatt";
});

const renderedAssistantHtml = computed(() => {
  if (!mdReady.value) return messages.value.map(() => "");
  const lastIndex = messages.value.length - 1;
  return messages.value.map((msg, i) => {
    if (msg.role !== "assistant" || !msg.content) return "";
    const isStreamingLast = isLoading.value && i === lastIndex;
    return isStreamingLast
      ? renderMarkdown(msg.content)
      : getCachedMarkdown(msg.content);
  });
});

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  const container = messagesContainer.value;
  if (!container) return;
  container.scrollTo({ top: container.scrollHeight, behavior });
}

function handleScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  const distFromBottom = Math.ceil(
    el.scrollHeight - el.scrollTop - el.clientHeight,
  );
  isAtBottom.value = distFromBottom <= 50;
  showScrollButton.value = distFromBottom > 200;
  chatStore.savedScrollPosition = el.scrollTop;
}

watch(
  messages,
  () => {
    nextTick(() => {
      if (!isLoading.value && isAtBottom.value) {
        scrollToBottom("auto");
      }
    });
  },
  { deep: true },
);

watch(
  () => chatStore.currentConversationId,
  () => {
    nextTick(() => {
      scrollToBottom("auto");
    });
  },
);

watch(currentUserId, (nextId, prevId) => {
  if (prevId && !nextId) {
    chatStore.resetOnLogout();
  }
});

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => chatInputRef.value?.focus());
  } else {
    isHistoryOpen.value = false;
  }
});

onMounted(() => {
  if (chatStore.currentExamId !== props.examId) {
    chatStore.clearChat();
    chatStore.currentExamId = props.examId;
  }

  nextTick(() => {
    const el = messagesContainer.value;
    if (!el) return;
    if (chatStore.savedScrollPosition > 0) {
      el.scrollTop = chatStore.savedScrollPosition;
      handleScroll();
    } else {
      scrollToBottom("auto");
    }
  });
});

async function handleSend() {
  if (!draftInput.value.trim() || isLoading.value) return;
  const text = draftInput.value;
  draftInput.value = "";
  isUserScrolling.value = false;
  isAtBottom.value = true;
  showScrollButton.value = false;

  nextTick(() => scrollToBottom("smooth"));

  await send(text, {
    modelId: selectedModelId.value,
  });
}

function handleCancel() {
  const cancelled = cancelGeneration();
  if (cancelled) {
    draftInput.value = cancelled;
    chatInputRef.value?.focus();
  }
}

function toggleHistory() {
  if (!chatStore.isOpen) return;
  isHistoryOpen.value = !isHistoryOpen.value;
}

function startNewChat() {
  chatStore.messages = [];
  chatStore.draftInput = "";
  chatStore.currentConversationId = null;
  chatStore.currentConversationTitle = null;
  chatStore.savedScrollPosition = 0;
  chatStore.setLoading(false);
  isHistoryOpen.value = false;
  nextTick(() => chatInputRef.value?.focus());
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.repeat) return;

  const isHistoryShortcut =
    (e.metaKey || e.ctrlKey) && (e.key === "." || e.code === "Period");

  if (isHistoryShortcut) {
    e.preventDefault();
    toggleHistory();
    return;
  }

  if (e.key === "Escape") {
    if (isHistoryOpen.value) {
      e.preventDefault();
      isHistoryOpen.value = false;
      return;
    }

    if (chatStore.isOpen) {
      chatStore.close();
    }
  }
}

onMounted(() => document.addEventListener("keydown", handleKeyDown, true));
onUnmounted(() => document.removeEventListener("keydown", handleKeyDown, true));

defineExpose({ focusInput: () => chatInputRef.value?.focus() });
</script>

<template>
  <div class="h-full w-full flex bg-background overflow-hidden relative">
    <div
      class="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-out"
    >
      <div class="flex-1 min-h-0 relative">
        <div class="absolute inset-x-0 top-0 z-20 pointer-events-none">
          <ChatHeader
            class="pointer-events-auto"
            :has-solution="hasSolution"
            :title="chatHeaderTitle"
            :history-open="isHistoryOpen"
            @close="emit('close')"
            @open-history="toggleHistory"
            @new-chat="startNewChat"
          />
        </div>

        <div
          ref="messagesContainer"
          class="h-full w-full overflow-y-auto overflow-x-hidden px-4 pt-20 custom-scrollbar"
          @scroll="handleScroll"
        >
          <div
            v-if="messages.length === 0"
            class="h-full flex flex-col items-center justify-center px-4 text-center pb-24"
          >
            <h2 class="text-2xl font-medium mb-3 text-foreground">
              Vad kan jag hjälpa till med?
            </h2>
            <p
              class="text-muted-foreground text-sm max-w-70 sm:max-w-md mb-8 leading-relaxed"
            >
              Ställ frågor om tentan, be om ledtrådar eller få hjälp att förstå
              lösningarna.
            </p>
            <NuxtLink
              to="/ai-policy"
              target="_blank"
              class="text-[11px] text-muted-foreground/60 hover:text-foreground transition-all duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5"
            >
              Läs vår AI-policy
            </NuxtLink>
          </div>

          <div v-else class="space-y-6 max-w-xl mx-auto w-full">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="msg.role === 'user' ? 'flex justify-end' : ''"
              v-memo="[
                msg.role,
                msg.content,
                isLoading && i === messages.length - 1,
                mdReady,
              ]"
            >
              <div
                v-if="msg.role === 'user'"
                class="bg-primary/10 text-foreground px-4 py-2 rounded-3xl max-w-[85%] w-fit"
              >
                <p class="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {{ msg.content }}
                </p>
              </div>

              <div v-else class="w-full px-1 py-2">
                <div
                  v-if="!msg.content && isLoading && i === messages.length - 1"
                  class="flex items-center gap-2 h-6"
                >
                  <LucideLoader
                    class="variable-spin w-4 h-4 text-muted-foreground"
                  />
                  <span class="shimmer-text text-sm">Tänker...</span>
                </div>
                <div
                  v-else
                  class="prose dark:prose-invert prose-hr:border-foreground/10 marker:text-foreground marker:font-semibold"
                  v-html="renderedAssistantHtml[i]"
                />
              </div>
            </div>

            <div ref="messagesEndRef" class="h-px w-full" />
            <div class="h-24 w-full shrink-0" />
          </div>
        </div>

        <div
          class="absolute bottom-0 left-0 right-0 pt-10 pb-4 pointer-events-none z-10"
        >
          <ChatInput
            ref="chatInputRef"
            v-model="draftInput"
            :is-loading="isLoading"
            :give-direct-answer="giveDirectAnswer"
            :selected-model-id="selectedModelId"
            :show-scroll-button="showScrollButton"
            :course-code="courseCode"
            :has-solution="hasSolution"
            class="pointer-events-auto"
            @send="handleSend"
            @cancel="handleCancel"
            @scroll-to-bottom="scrollToBottom('smooth')"
            @update:give-direct-answer="giveDirectAnswer = $event"
            @update:selected-model-id="selectedModelId = $event"
          />
        </div>
      </div>
    </div>

    <ChatHistorySidebar v-model:open="isHistoryOpen" />
  </div>
</template>

<style scoped>
.prose :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  padding: 0.5rem 0;
}

.prose :deep(.katex-display) > .katex {
  max-width: none;
  white-space: normal;
}

.prose :deep(.katex) {
  max-width: 100%;
}

.prose :deep(p) {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.prose :deep(.katex-display)::-webkit-scrollbar {
  height: 4px;
}

.prose :deep(.katex-display)::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 2px;
}

.prose :deep(.katex-display)::-webkit-scrollbar-track {
  background: transparent;
}
</style>
