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
    delimiters: ["dollars"],
    katexOptions: {
      throwOnError: false,
      errorColor: "inherit",
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
  return DOMPurify.sanitize(md.value.render(content), {
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

function wrapTables() {
  const container = messagesContainer.value;
  if (!container) return;
  container.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("table-scroll")) return;

    const outer = document.createElement("div");
    outer.className = "table-outer";

    const scroll = document.createElement("div");
    scroll.className = "table-scroll";

    const fade = document.createElement("div");
    fade.className = "table-fade";

    outer.appendChild(scroll);
    outer.appendChild(fade);
    table.parentNode!.insertBefore(outer, table);
    scroll.appendChild(table);

    scroll.addEventListener("scroll", () => {
      const atEnd =
        scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 4;
      fade.style.opacity = atEnd ? "0" : "1";
    });
  });
}

watch(
  messages,
  () => {
    if (isAtBottom.value) {
      nextTick(() => {
        scrollToBottom("auto");
        wrapTables();
      });
    }
  },
  { deep: true },
);

watch(mdReady, (ready) => {
  if (ready) {
    nextTick(() => wrapTables());
  }
});

watch(
  () => chatStore.currentConversationId,
  () => {
    nextTick(() => {
      scrollToBottom("auto");
      wrapTables();
    });
  },
);

watch(currentUserId, (nextId, prevId) => {
  if (prevId && !nextId) {
    chatStore.resetOnLogout();
  }
});

watch(isOpen, (open) => {
  if (!open) {
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
    wrapTables();
  });
});

async function handleSend() {
  if (!draftInput.value.trim() || isLoading.value) return;
  const text = draftInput.value;
  draftInput.value = "";
  isUserScrolling.value = false;
  isAtBottom.value = true;
  await send(text, {
    giveDirectAnswer: giveDirectAnswer.value,
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
  if (!chatStore.isOpen || !currentUserId.value) return;
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
  <div
    class="h-full w-full flex border-l bg-background overflow-hidden relative"
  >
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
            <h2
              class="text-2xl tracking-tight font-medium mb-3 text-foreground"
            >
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
                class="bg-primary/10 text-foreground px-4 py-2 rounded-2xl max-w-[85%] w-fit"
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
                  <span class="text-sm text-muted-foreground animate-pulse"
                    >Tänker...</span
                  >
                </div>
                <div
                  v-else
                  class="prose dark:prose-invert max-w-none"
                  v-html="renderedAssistantHtml[i]"
                />
              </div>
            </div>

            <div ref="messagesEndRef" class="h-px w-full" />
            <div class="h-32 w-full shrink-0" />
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
.prose :deep(.table-outer) {
  position: relative;
  background-color: hsl(var(--card, var(--background)));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 2px 8px hsl(var(--foreground) / 0.05);
  margin: 1.5rem 0;
  overflow: hidden;
}

.prose :deep(.table-scroll) {
  overflow-x: auto;
  width: 100%;
}

.prose :deep(.table-fade) {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 56px;
  background: linear-gradient(
    to right,
    transparent,
    hsl(var(--card, var(--background)) / 0.95)
  );
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.prose :deep(table) {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: transparent;
}

.prose :deep(thead) {
  background-color: hsl(var(--muted) / 0.5);
  border-bottom: 1px solid hsl(var(--border));
}

.prose :deep(th) {
  padding: 0.875rem 1.25rem;
  text-align: left;
  font-weight: 600;
  color: hsl(var(--foreground) / 0.8);
  white-space: nowrap;
}

.prose :deep(td) {
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid hsl(var(--border) / 0.4);
  vertical-align: middle;
  line-height: 1.6;
}

.prose :deep(tbody tr:last-child td) {
  border-bottom: none;
}

.prose :deep(tbody tr) {
  transition: background-color 0.15s ease;
}

.prose :deep(tbody tr:hover td) {
  background-color: hsl(var(--muted) / 0.3);
}

.prose :deep(code:not(pre code)) {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  padding: 0.15em 0.4em;
  border-radius: 5px;
  font-size: 0.82em;
  font-family: var(--font-mono, monospace);
}

.prose :deep(pre.shiki) {
  background-color: var(--shiki-light-bg);
  color: var(--shiki-light);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.82rem;
  font-family: var(--font-mono, monospace);
  line-height: 1.6;
}

.prose :deep(pre.shiki span) {
  color: var(--shiki-light);
  background-color: var(--shiki-light-bg);
}

.dark .prose :deep(pre.shiki) {
  background-color: var(--shiki-dark-bg);
  color: var(--shiki-dark);
}

.dark .prose :deep(pre.shiki span) {
  color: var(--shiki-dark);
  background-color: var(--shiki-dark-bg);
}

.prose :deep(pre.shiki code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  font-family: inherit;
}

.prose :deep(pre:not(.shiki)) {
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.82rem;
}

.prose :deep(blockquote) {
  border-left: 3px solid hsl(var(--primary));
  background: hsl(var(--muted) / 0.4);
  border-radius: 0 8px 8px 0;
  padding: 0.6rem 1rem;
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-style: normal;
}

.prose :deep(a) {
  color: hsl(var(--primary));
  text-decoration: none;
}

.prose :deep(a:hover) {
  text-decoration: underline;
}

.prose :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}

.prose :deep(.katex) {
  max-width: 100%;
}
</style>
