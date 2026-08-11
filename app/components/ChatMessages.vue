<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { Message } from "@/stores/chat";
import {
  initChatMarkdown,
  renderChatMarkdown,
  renderCachedChatMarkdown,
} from "@/lib/chat-markdown";

const props = withDefaults(
  defineProps<{
    messages: Message[];
    isLoading: boolean;
    /** Extra classes on the scroll container — each shell clears its own header. */
    contentClass?: string;
    /**
     * Offer "Svara" over a selection inside an answer. Mouse-only: it hangs off
     * `mouseup` and a `mousedown`-triggered button, neither of which touch text
     * selection produces, and iOS puts its own callout menu on top regardless.
     */
    enableSelectionPopover?: boolean;
  }>(),
  { contentClass: "", enableSelectionPopover: true },
);

const emit = defineEmits<{
  replyToSelection: [text: string];
  "update:showScrollButton": [value: boolean];
}>();

const chatStore = useChatStore();

const mdReady = ref(false);

// The pipeline itself (MarkdownIt instance, KaTeX/Shiki caches, DOMPurify
// hook) is shared at module scope — see @/lib/chat-markdown. This component
// only needs to know when it is ready to render.
initChatMarkdown().then(() => {
  mdReady.value = true;
});

const messagesContainer = ref<HTMLDivElement | null>(null);

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
  if (!props.enableSelectionPopover) return;
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
  window.getSelection()?.removeAllRanges();
  selectionPopover.value.visible = false;
  emit("replyToSelection", text);
}

const renderedAssistantHtml = computed(() => {
  if (!mdReady.value) return props.messages.map(() => "");
  const lastIndex = props.messages.length - 1;
  return props.messages.map((msg, i) => {
    if (msg.role !== "assistant" || !msg.content) return "";
    const isStreamingLast = props.isLoading && i === lastIndex;
    return isStreamingLast
      ? renderChatMarkdown(msg.content)
      : renderCachedChatMarkdown(msg.content);
  });
});

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  const container = messagesContainer.value;
  if (!container) return;
  container.scrollTo({ top: container.scrollHeight, behavior });
}

// Only read back on remount, so there is no reason to push it through the
// store on every scroll event — it is kept in a plain local and flushed when
// the panel goes away.
let latestScrollTop = 0;

function persistScrollPosition() {
  chatStore.savedScrollPosition = latestScrollTop;
}

function handleScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  const distFromBottom = Math.ceil(
    el.scrollHeight - el.scrollTop - el.clientHeight,
  );
  emit("update:showScrollButton", distFromBottom > 200);
  latestScrollTop = el.scrollTop;

  if (selectionPopover.value.visible) {
    const delta = Math.abs(el.scrollTop - selectionPopoverScrollAnchor.value);
    if (delta > 80) {
      selectionPopover.value.visible = false;
    }
  }
}

/** Pick up where the last mount left off, or land at the newest message. */
function restoreScroll() {
  const el = messagesContainer.value;
  if (!el) return;
  if (chatStore.savedScrollPosition > 0) {
    el.scrollTop = chatStore.savedScrollPosition;
    handleScroll();
  } else {
    scrollToBottom("auto");
  }
}

function resetScrollState() {
  latestScrollTop = 0;
  emit("update:showScrollButton", false);
}

watch(
  () => props.isLoading,
  (loading) => {
    if (!loading) return;
    loadingPhrase.value =
      loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)] ??
      loadingPhrases[0];
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("selectionchange", handleSelectionChange);
});

onUnmounted(() => {
  document.removeEventListener("selectionchange", handleSelectionChange);
  persistScrollPosition();
});

defineExpose({
  scrollToBottom,
  restoreScroll,
  persistScrollPosition,
  resetScrollState,
});
</script>

<template>
  <div ref="messagesContainer"
    class="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain px-4 custom-scrollbar" :class="contentClass"
    @scroll="handleScroll" @mouseup="handleMessageMouseUp" @click="handleCodeCopy">
    <!-- min-h-full, not h-full: the mobile sheet's partial detents leave this
         box shorter than its content, and a fixed height there squashed the
         mascot to a dot and clipped the heading instead of scrolling. -->
    <div
      class="min-h-full flex flex-col items-center justify-center px-4 py-8 text-center"
      v-if="messages.length === 0">
      <ChatMascot class="w-16 h-16 mb-5 shrink-0" />
      <h2 class="text-2xl font-semibold mb-3 text-foreground">
        Vad kan jag hjälpa till med?
      </h2>
      <p class="text-muted-foreground text-sm max-w-70 sm:max-w-md mb-8 leading-relaxed">
        Ställ frågor om tentan, be om ledtrådar eller få hjälp att förstå
        lösningarna.
      </p>
      <NuxtLink to="/ai-policy" target="_blank"
        class="text-2xs text-muted-foreground/60 hover:text-foreground transition-colors duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5">
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
          <div class="bg-primary/10 text-foreground px-4 py-2 rounded-2xl w-fit">
            <p class="text-base leading-relaxed whitespace-pre-wrap">
              {{ msg.content }}
            </p>
          </div>
        </div>

        <div v-else class="w-full min-w-0 px-1 py-2 overflow-hidden" data-role="assistant" :data-streaming="isLoading && i === messages.length - 1 ? 'true' : undefined
          ">
          <div v-if="!msg.content && isLoading && i === messages.length - 1" class="flex items-center gap-2 h-6">
            <LucideLoader class="variable-spin w-4 h-4 text-muted-foreground" />
            <span class="shimmer-text text-sm">{{ loadingPhrase }}</span>
          </div>
          <div
            class="prose max-w-full min-w-0 prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-md prose-h4:text-base prose-strong:font-semibold dark:prose-invert prose-p:font-normal prose-hr:border-secondary prose-th:border-secondary prose-td:border-secondary prose-blockquote:border-secondary marker:text-foreground marker:font-semibold"
            v-html="renderedAssistantHtml[i]" />
        </div>
      </div>

      <div class="h-px w-full" />
      <div class="h-32 w-full shrink-0" />
    </div>

    <SelectionPopover v-if="enableSelectionPopover" :visible="selectionPopover.visible" :x="selectionPopover.x"
      :y="selectionPopover.y" @reply="handleReplyToSelection" />
  </div>
</template>

<style>
@import "katex/dist/katex.min.css";
</style>

<style scoped>
.prose :deep(.katex-display) {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  padding: 0.5rem 0;
  margin: 0.75rem 0;
}

.prose :deep(.katex-display)>.katex {
  max-width: 100%;
}

.prose :deep(.katex) {
  max-width: 100%;
  white-space: nowrap;
}

.prose :deep(p),
.prose :deep(li) {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

/* A table is the one block the pipeline emits with no scroll container of its
   own, so a wide one just ran off the side of a phone with no way to reach the
   rest. `display: block` + `max-content` turns the table itself into the
   scroller; `contain` stops a swipe that hits the end from dragging the sheet. */
.prose :deep(table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
}

.prose :deep(table)::-webkit-scrollbar {
  height: 4px;
}

.prose :deep(table)::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(table)::-webkit-scrollbar-track {
  background: transparent;
}

/* Same for the other blocks that can carry an unbreakable wide run. */
.prose :deep(pre),
.prose :deep(blockquote) {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
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
    background-color var(--duration-fast) var(--ease-spring),
    color var(--duration-fast) var(--ease-spring);
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
