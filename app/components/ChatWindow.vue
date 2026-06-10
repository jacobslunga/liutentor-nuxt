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
import { useMermaid } from "@/composables/useMermaid";
import { usePlot } from "@/composables/usePlot";

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

  instance.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    if (!token) return "";
    const info = token.info ? token.info.trim() : "";
    const rawLang = info.split(/\s+/)[0] || "";

    if (rawLang === "mermaid") {
      return `<div class="mermaid-block" data-state="pending"><pre class="mermaid-source">${escapeHtml(
        token.content,
      )}</pre></div>`;
    }

    if (rawLang === "plot") {
      return `<div class="plot-block" data-state="pending"><span class="plot-loading shimmer-text">Ritar graf...</span><pre class="plot-source">${escapeHtml(
        token.content,
      )}</pre></div>`;
    }

    const language =
      rawLang && loadedLangs.has(rawLang as never) ? rawLang : "text";

    let inner: string;
    try {
      inner = highlighter.highlight(token.content, {
        lang: language,
        themes: {
          light: "min-light",
          dark: "min-dark",
        },
        defaultColor: false,
      });
    } catch {
      inner = `<pre class="shiki"><code>${escapeHtml(token.content)}</code></pre>`;
    }

    const label = rawLang || "text";

    const copyIcon = `<svg class="code-icon code-icon-copy" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const checkIcon = `<svg class="code-icon code-icon-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;

    return `<div class="code-block"><div class="code-header"><span class="code-lang">${escapeHtml(
      label,
    )}</span><button class="code-copy" type="button" aria-label="Kopiera kod">${copyIcon}${checkIcon}<span class="code-copy-label">Kopiera</span></button></div>${inner}</div>`;
  };

  md.value = instance;
  mdReady.value = true;
  renderCache.clear();
}

initMarkdown();

const LATEX_ENVS = "array|aligned|align\\*?|cases|[pbvB]?matrix|gathered|gather\\*?|smallmatrix";

function normalizeMath(content: string): string {
  const segments = content.split(/(```[\s\S]*?(?:```|$))/g);
  return segments
    .map((seg, i) => {
      if (i % 2 === 1) return seg;
      let out = seg;
      out = out.replace(
        /\\\[([\s\S]+?)\\\]/g,
        (_, expr) => `\n\n$$\n${expr.trim()}\n$$\n\n`,
      );
      out = out.replace(/\\\((.+?)\\\)/g, (_, expr) => `$${expr.trim()}$`);
      out = out.replace(
        new RegExp(
          `(?<!\\$)(\\\\begin\\{(${LATEX_ENVS})\\}[\\s\\S]*?\\\\end\\{\\2\\})(?!\\$)`,
          "g",
        ),
        (_, env) => `\n\n$$\n${env}\n$$\n\n`,
      );
      out = out.replace(/\$\$([^$]+?)\$\$/g, (_, expr) =>
        expr.includes("\n")
          ? `\n\n$$\n${expr.replace(/\n{2,}/g, "\n").trim()}\n$$\n\n`
          : `$$${expr.trim()}$$`,
      );
      return out;
    })
    .join("");
}

function renderMarkdown(content: string): string {
  if (!md.value) return "";
  const normalized = normalizeMath(content);
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
const { hydrate: hydrateMermaid } = useMermaid(messagesContainer);
const { hydrate: hydratePlots } = usePlot(messagesContainer);

function hydrateBlocks() {
  hydrateMermaid();
  hydratePlots();
}
const chatInputRef = ref<{ focus: () => void } | null>(null);
const isUserScrolling = ref(false);
const isAtBottom = ref(true);
const showScrollButton = ref(false);

const selectionContext = ref("");
const selectionPopover = ref({ visible: false, x: 0, y: 0 });
const selectionPopoverScrollAnchor = ref(0);

const loadingPhrases = [
  "Baljar...",
  "Går till Terra...",
  "Kollar Lisam...",
  "Letar grupprum i B-huset...",
  "Köar i Kårallen...",
  "Räknar om HP...",
  "Cyklar över Campus Valla...",
  "Hämtar kaffe i Key...",
  "Frågar någon i märkesbacken...",
  "Letar facit i tenta-P...",
  "Tar en omväg via Zenit...",
];

const loadingPhrase = ref(loadingPhrases[0]);

const copyTimers = new WeakMap<HTMLElement, number>();

function handleCodeCopy(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest(
    ".code-copy",
  ) as HTMLElement | null;
  if (!btn) return;

  const pre = btn.closest(".code-block")?.querySelector("pre");
  const code = pre?.textContent ?? "";
  if (!code) return;

  navigator.clipboard.writeText(code).catch(() => { });

  const label = btn.querySelector(".code-copy-label");
  if (label) label.textContent = "Kopierad";
  btn.classList.add("copied");

  const existing = copyTimers.get(btn);
  if (existing) window.clearTimeout(existing);
  const t = window.setTimeout(() => {
    if (label) label.textContent = "Kopiera";
    btn.classList.remove("copied");
    copyTimers.delete(btn);
  }, 1500);
  copyTimers.set(btn, t);
}

function handleMessageMouseUp(e: MouseEvent) {
  if ((e.target as HTMLElement | null)?.closest?.(".plot-block")) return;
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || !selection?.rangeCount || !messagesContainer.value) {
      selectionPopover.value.visible = false;
      return;
    }

    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    const inAssistant = !!el?.closest('[data-role="assistant"]');

    if (!inAssistant) {
      selectionPopover.value.visible = false;
      return;
    }

    const rect = range.getBoundingClientRect();
    selectionPopoverScrollAnchor.value =
      messagesContainer.value?.scrollTop ?? 0;
    selectionPopover.value = {
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
  }, 0);
}

function handleSelectionChange() {
  if (!window.getSelection()?.toString().trim()) {
    selectionPopover.value.visible = false;
  }
}

function handleReplyToSelection() {
  const text = window.getSelection()?.toString().trim();
  if (!text) return;
  selectionContext.value = text;
  window.getSelection()?.removeAllRanges();
  selectionPopover.value.visible = false;
  nextTick(() => chatInputRef.value?.focus());
}

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

  if (selectionPopover.value.visible) {
    const delta = Math.abs(el.scrollTop - selectionPopoverScrollAnchor.value);
    if (delta > 80) {
      selectionPopover.value.visible = false;
    }
  }
}

watch(renderedAssistantHtml, () => {
  nextTick(() => hydrateBlocks());
});

watch(
  () => chatStore.currentConversationId,
  () => {
    nextTick(() => {
      scrollToBottom("auto");
      hydrateBlocks();
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

watch(
  isLoading,
  (loading) => {
    if (!loading) return;
    loadingPhrase.value =
      loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)] ??
      loadingPhrases[0];
  },
  { immediate: true },
);

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
    hydrateBlocks();
  });
});

async function handleSend() {
  if (!draftInput.value.trim() || isLoading.value) return;
  const text = draftInput.value;
  const context = selectionContext.value || undefined;
  draftInput.value = "";
  selectionContext.value = "";
  isUserScrolling.value = false;
  isAtBottom.value = true;
  showScrollButton.value = false;

  nextTick(() => scrollToBottom("smooth"));

  await send(text, {
    modelId: selectedModelId.value,
    selectionContext: context,
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
  selectionContext.value = "";
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

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("selectionchange", handleSelectionChange);
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown, true);
  document.removeEventListener("selectionchange", handleSelectionChange);
});

defineExpose({ focusInput: () => chatInputRef.value?.focus() });
</script>

<template>
  <div class="h-full w-full flex bg-background overflow-hidden relative">
    <div class="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-out">
      <div class="flex-1 min-h-0 relative">
        <div class="absolute inset-x-0 top-0 z-20 pointer-events-none">
          <ChatHeader class="pointer-events-auto" :has-solution="hasSolution" :title="chatHeaderTitle"
            :history-open="isHistoryOpen" @close="emit('close')" @open-history="toggleHistory"
            @new-chat="startNewChat" />
        </div>

        <div ref="messagesContainer" class="h-full w-full overflow-y-auto overflow-x-hidden px-4 pt-20 custom-scrollbar"
          @scroll="handleScroll" @mouseup="handleMessageMouseUp" @click="handleCodeCopy">
          <div v-if="messages.length === 0"
            class="h-full flex flex-col items-center justify-center px-4 text-center pb-24">
            <h2 class="text-2xl font-medium mb-3 text-foreground">
              Vad kan jag hjälpa till med?
            </h2>
            <p class="text-muted-foreground text-sm max-w-70 sm:max-w-md mb-8 leading-relaxed">
              Ställ frågor om tentan, be om ledtrådar eller få hjälp att förstå
              lösningarna.
            </p>
            <NuxtLink to="/ai-policy" target="_blank"
              class="text-[11px] text-muted-foreground/60 hover:text-foreground transition-all duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5">
              Läs vår AI-policy
            </NuxtLink>
          </div>

          <div v-else class="space-y-6 max-w-2xl mx-auto w-full">
            <div v-for="(msg, i) in messages" :key="i" :class="msg.role === 'user' ? 'flex justify-end' : ''" v-memo="[
              msg.role,
              msg.content,
              msg.selectionContext,
              isLoading && i === messages.length - 1,
              mdReady,
            ]">
              <div v-if="msg.role === 'user'" class="flex flex-col items-end gap-1.5 max-w-[85%]">
                <div v-if="msg.selectionContext"
                  class="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic line-clamp-3 text-right">
                  "{{ msg.selectionContext }}"
                </div>
                <div class="bg-primary/10 text-foreground px-4 py-2 rounded-3xl w-fit">
                  <p class="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {{ msg.content }}
                  </p>
                </div>
              </div>

              <div v-else class="w-full px-1 py-2" data-role="assistant"
                :data-streaming="isLoading && i === messages.length - 1 ? 'true' : undefined">
                <div v-if="!msg.content && isLoading && i === messages.length - 1" class="flex items-center gap-2 h-6">
                  <LucideLoader class="variable-spin w-4 h-4 text-muted-foreground" />
                  <span class="shimmer-text text-sm">{{ loadingPhrase }}</span>
                </div>
                <div
                  class="prose font-normal dark:prose-invert prose-p:font-normal prose-headings:font-medium prose-strong:font-medium prose-hr:border-foreground/10 marker:text-foreground marker:font-medium"
                  v-html="renderedAssistantHtml[i]" />
              </div>
            </div>

            <div ref="messagesEndRef" class="h-px w-full" />
            <div class="h-32 w-full shrink-0" />
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 pt-10 pb-4 pointer-events-none z-10">
          <ChatInput ref="chatInputRef" v-model="draftInput" :is-loading="isLoading"
            :give-direct-answer="giveDirectAnswer" :selected-model-id="selectedModelId"
            :show-scroll-button="showScrollButton" :course-code="courseCode" :has-solution="hasSolution"
            :selection-context="selectionContext" class="pointer-events-auto" @send="handleSend" @cancel="handleCancel"
            @scroll-to-bottom="scrollToBottom('smooth')" @update:give-direct-answer="giveDirectAnswer = $event"
            @update:selected-model-id="selectedModelId = $event" @clear-selection-context="selectionContext = ''" />
        </div>
      </div>
    </div>

    <ChatHistorySidebar v-model:open="isHistoryOpen" />

    <SelectionPopover :visible="selectionPopover.visible" :x="selectionPopover.x" :y="selectionPopover.y"
      @reply="handleReplyToSelection" />
  </div>
</template>

<style scoped>
.prose :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  padding: 0.5rem 0;
}

.prose :deep(.katex-display)>.katex {
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
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(.katex-display)::-webkit-scrollbar-track {
  background: transparent;
}

.prose :deep(.code-block) {
  margin: 1.25rem 0;
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  border-radius: 1.25rem;
  overflow: hidden;
}

.prose :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem 0.4rem 1rem;
  background-color: color-mix(in oklch, var(--secondary) 60%, transparent);
  border-bottom: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
}

.prose :deep(.code-lang) {
  font-family: "SF Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
}

.prose :deep(.code-copy:hover) {
  background-color: color-mix(in oklch, var(--foreground) 6%, transparent);
  color: var(--foreground);
}

.prose :deep(.code-copy.copied) {
  color: var(--primary);
}

.prose :deep(.code-block pre.shiki) {
  margin: 0;
  border: none;
  border-radius: 0;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.6;
  background-color: var(--shiki-light-bg);
}

.prose :deep(.code-block pre.shiki),
.prose :deep(.code-block pre.shiki span) {
  color: var(--shiki-light);
}

.dark .prose :deep(.code-block pre.shiki) {
  background-color: var(--shiki-dark-bg);
}

.dark .prose :deep(.code-block pre.shiki span) {
  color: var(--shiki-dark);
}

.prose :deep(:not(pre) > code)::before,
.prose :deep(:not(pre) > code)::after {
  content: none;
}

.prose :deep(.code-copy .code-icon-check) {
  display: none;
}

.prose :deep(.code-copy.copied .code-icon-copy) {
  display: none;
}

.prose :deep(.code-copy.copied .code-icon-check) {
  display: inline;
}

.prose :deep(.code-copy) {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  color: var(--muted-foreground);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.prose :deep(.code-copy-label) {
  margin-left: 0.1rem;
}

.prose :deep(.mermaid-block) {
  margin: 1.25rem 0;
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  border-radius: 1.25rem;
  overflow: hidden;
  max-width: 100%;
}

.prose :deep(.mermaid-block[data-state="pending"] .mermaid-source),
.prose :deep(.mermaid-block[data-state="rendering"] .mermaid-source),
.prose :deep(.mermaid-block[data-state="done"] .mermaid-source) {
  display: none;
}

.prose :deep(.mermaid-block[data-state="pending"]::before),
.prose :deep(.mermaid-block[data-state="rendering"]::before) {
  content: "Ritar diagram...";
  display: block;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  background: linear-gradient(90deg,
      color-mix(in srgb, var(--muted-foreground), transparent 40%) 0%,
      color-mix(in srgb, var(--muted-foreground), transparent 40%) 35%,
      var(--foreground) 50%,
      color-mix(in srgb, var(--muted-foreground), transparent 40%) 65%,
      color-mix(in srgb, var(--muted-foreground), transparent 40%) 100%);
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: shimmer-sweep 3.2s linear infinite;
}

.prose :deep(.mermaid-block[data-state="error"] .mermaid-source) {
  margin: 0;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.6;
  font-family: "SF Mono", monospace;
  color: var(--muted-foreground);
  background-color: color-mix(in oklch, var(--secondary) 60%, transparent);
}

.prose :deep(.mermaid-svg) {
  display: flex;
  justify-content: center;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  max-width: 100%;
}

.prose :deep(.mermaid-svg svg) {
  max-width: 100%;
  height: auto;
}

.prose :deep(.mermaid-svg)::-webkit-scrollbar {
  height: 4px;
}

.prose :deep(.mermaid-svg)::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(.mermaid-svg)::-webkit-scrollbar-track {
  background: transparent;
}

.prose :deep(.plot-block) {
  margin: 1.25rem 0;
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  border-radius: 1.25rem;
  overflow: hidden;
  max-width: 100%;
}

.prose :deep(.plot-block[data-state="pending"] .plot-source),
.prose :deep(.plot-block[data-state="rendering"] .plot-source),
.prose :deep(.plot-block[data-state="done"] .plot-source) {
  display: none;
}

.prose :deep(.plot-block .plot-loading) {
  display: block;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
}

.prose :deep(.plot-block[data-state="done"] .plot-loading),
.prose :deep(.plot-block[data-state="error"] .plot-loading) {
  display: none;
}

.prose :deep(.plot-block[data-state="error"] .plot-source) {
  margin: 0;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.6;
  font-family: "SF Mono", monospace;
  color: var(--muted-foreground);
  background-color: color-mix(in oklch, var(--secondary) 60%, transparent);
}

.prose :deep(.plot-title) {
  font-family: "SF Mono", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--muted-foreground);
  padding: 0.4rem 1rem;
  background-color: color-mix(in oklch, var(--secondary) 60%, transparent);
  border-bottom: 1px solid color-mix(in oklch, var(--foreground) 8%, transparent);
}

.prose :deep(.plot-host) {
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  overflow-x: auto;
  max-width: 100%;
}

.prose :deep(.plot-host svg.function-plot) {
  max-width: 100%;
  height: auto;
}

.prose :deep(.function-plot text) {
  fill: var(--muted-foreground);
}

.prose :deep(.function-plot .axis path.domain) {
  stroke: color-mix(in oklch, var(--foreground) 25%, transparent);
}

.prose :deep(.function-plot .tick line) {
  stroke: color-mix(in oklch, var(--foreground) 10%, transparent);
}

.prose :deep(.function-plot .origin) {
  stroke: var(--foreground);
}

.prose :deep(.function-plot .annotations path) {
  stroke: color-mix(in oklch, var(--foreground) 30%, transparent);
}

.prose :deep(.function-plot .annotations text) {
  fill: var(--muted-foreground);
}

.prose :deep(.function-plot .tip text) {
  fill: var(--foreground);
}

.prose :deep(.plot-host)::-webkit-scrollbar {
  height: 4px;
}

.prose :deep(.plot-host)::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(.plot-host)::-webkit-scrollbar-track {
  background: transparent;
}
</style>
