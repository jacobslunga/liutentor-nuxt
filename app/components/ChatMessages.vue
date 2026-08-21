<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useResizeObserver } from "@vueuse/core";
import type { Message } from "@/stores/chat";
import {
  initChatMarkdown,
  renderChatMarkdown,
  renderCachedChatMarkdown,
} from "@/lib/chat-markdown";
import {
  parseAssistantContent,
  type InteractiveGraphSpec,
} from "@/lib/interactive-graph";

const props = withDefaults(
  defineProps<{
    messages: Message[];
    isLoading: boolean;
    assistantClass?: string;
    contentClass?: string;
    enableSelectionPopover?: boolean;
  }>(),
  { assistantClass: "", contentClass: "", enableSelectionPopover: true },
);

const emit = defineEmits<{
  replyToSelection: [text: string];
  "update:showScrollButton": [value: boolean];
  "update:contentBottom": [value: number];
}>();

const chatStore = useChatStore();

const mdReady = ref(false);

initChatMarkdown().then(() => {
  mdReady.value = true;
});

const messagesContainer = ref<HTMLDivElement | null>(null);
const messagesList = ref<HTMLDivElement | null>(null);
const contentEndMarker = ref<HTMLDivElement | null>(null);

function reportContentBottom() {
  emit(
    "update:contentBottom",
    contentEndMarker.value?.getBoundingClientRect().top ??
      Number.NEGATIVE_INFINITY,
  );
}

useResizeObserver(messagesContainer, reportContentBottom);
useResizeObserver(messagesList, reportContentBottom);

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

  navigator.clipboard.writeText(code).catch(() => {});

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
  if ((e.target as HTMLElement | null)?.closest?.(".interactive-graph")) return;
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
  if (!props.enableSelectionPopover) return;
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

function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

type RenderedAssistantSegment =
  | { type: "markdown"; html: string }
  | { type: "graph"; spec: InteractiveGraphSpec }
  | { type: "graph-pending" }
  | { type: "graph-error"; message: string };

const renderedAssistantSegments = computed<RenderedAssistantSegment[][]>(() => {
  if (!mdReady.value) return props.messages.map(() => []);
  const lastIndex = props.messages.length - 1;
  return props.messages.map((msg, i) => {
    if (msg.role !== "assistant" || !msg.content) return [];
    const isStreamingLast = props.isLoading && i === lastIndex;
    return parseAssistantContent(msg.content).map(
      (segment): RenderedAssistantSegment => {
        if (segment.type === "graph" && isStreamingLast) {
          return { type: "graph-pending" };
        }
        if (segment.type !== "markdown") return segment;
        return {
          type: "markdown",
          html: isStreamingLast
            ? renderChatMarkdown(segment.content)
            : renderCachedChatMarkdown(segment.content),
        };
      },
    );
  });
});

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  const container = messagesContainer.value;
  if (!container) return;
  container.scrollTo({ top: container.scrollHeight, behavior });
}

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
  reportContentBottom();

  if (selectionPopover.value.visible) {
    const delta = Math.abs(el.scrollTop - selectionPopoverScrollAnchor.value);
    if (delta > 80) {
      selectionPopover.value.visible = false;
    }
  }
}

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

watch(
  [() => props.messages.length, () => props.messages.at(-1)?.content, mdReady],
  () => nextTick(reportContentBottom),
  { flush: "post" },
);

onMounted(() => {
  nextTick(reportContentBottom);
  if (props.enableSelectionPopover) {
    document.addEventListener("selectionchange", handleSelectionChange);
  }
});

onUnmounted(() => {
  if (props.enableSelectionPopover) {
    document.removeEventListener("selectionchange", handleSelectionChange);
  }
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
  <div
    ref="messagesContainer"
    class="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain px-4 custom-scrollbar"
    :class="contentClass"
    @scroll="handleScroll"
    @mouseup="handleMessageMouseUp"
    @click="handleCodeCopy"
  >
    <div
      class="min-h-full flex flex-col items-center justify-center px-4 py-8 text-center"
      v-if="messages.length === 0"
    >
      <ChatMascot class="w-16 h-16 mb-5 shrink-0" />
      <h2 class="text-2xl font-semibold mb-3 text-foreground">
        Vad kan jag hjälpa till med?
      </h2>
      <p
        class="text-muted-foreground text-sm max-w-70 sm:max-w-md mb-8 leading-relaxed"
      >
        Ställ frågor om tentan eller få hjälp att förstå lösningarna.
      </p>
      <NuxtLink
        to="/ai-policy"
        target="_blank"
        class="text-2xs text-muted-foreground/60 hover:text-foreground transition-colors duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5"
      >
        Läs vår AI-policy
      </NuxtLink>
    </div>

    <div ref="messagesList" v-else class="space-y-6 max-w-2xl mx-auto w-full">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'flex justify-end' : ''"
        v-memo="[
          msg.role,
          msg.content,
          msg.selectionContext,
          msg.attachments
            ?.map((attachment) => `${attachment.id}:${attachment.active}`)
            .join(','),
          isLoading && i === messages.length - 1,
          mdReady,
        ]"
      >
        <div
          v-if="msg.role === 'user'"
          class="flex flex-col items-end gap-1.5 max-w-[85%]"
        >
          <div
            v-if="msg.selectionContext"
            class="border-l-2 border-muted-foreground/30 pl-3 text-sm text-muted-foreground italic line-clamp-3 text-right"
          >
            "{{ msg.selectionContext }}"
          </div>
          <div
            v-if="msg.attachments?.length"
            class="flex flex-wrap justify-end gap-1.5"
          >
            <div
              v-for="attachment in msg.attachments"
              :key="attachment.id"
              class="attachment-context-item flex min-w-0 max-w-full items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs"
              :class="
                attachment.active
                  ? 'bg-background'
                  : 'bg-muted/40 text-muted-foreground opacity-70'
              "
            >
              <LucideFileText
                v-if="attachment.mediaType === 'application/pdf'"
                class="size-3.5 shrink-0"
              />
              <img
                v-else-if="attachment.previewUrl"
                :src="attachment.previewUrl"
                alt=""
                class="size-16 shrink-0 rounded-lg object-cover"
              />
              <LucideImage v-else class="size-3.5 shrink-0" />
              <span class="max-w-20 truncate" :title="attachment.name">{{
                attachment.name
              }}</span>
              <span class="shrink-0 text-muted-foreground">{{
                formatFileSize(attachment.size)
              }}</span>
            </div>
          </div>
          <div
            v-if="msg.content"
            class="w-fit rounded-2xl bg-secondary px-4 py-2 text-secondary-foreground"
          >
            <p class="text-[15px] leading-relaxed whitespace-pre-wrap">
              {{ msg.content }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="w-full min-w-0 px-1 py-2 overflow-hidden"
          :class="assistantClass"
          data-role="assistant"
          :data-streaming="
            isLoading && i === messages.length - 1 ? 'true' : undefined
          "
        >
          <div
            v-if="!msg.content && isLoading && i === messages.length - 1"
            class="flex items-center gap-2 h-6"
          >
            <LucideLoader class="variable-spin w-4 h-4 text-muted-foreground" />
            <span class="shimmer-text text-sm">{{ loadingPhrase }}</span>
          </div>
          <div class="assistant-segments">
            <template
              v-for="(segment, segmentIndex) in renderedAssistantSegments[i]"
              :key="segmentIndex"
            >
              <div
                v-if="segment.type === 'markdown'"
                class="prose max-w-full min-w-0 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base dark:prose-invert marker:text-foreground marker:font-medium"
                v-html="segment.html"
              />
              <ClientOnly v-else-if="segment.type === 'graph'">
                <LazyChatInteractiveGraph :spec="segment.spec" />
                <template #fallback>
                  <div class="graph-artifact-status shimmer-text">
                    Förbereder graf...
                  </div>
                </template>
              </ClientOnly>
              <div
                v-else-if="segment.type === 'graph-pending'"
                class="graph-artifact-status shimmer-text"
              >
                Förbereder graf...
              </div>
              <div v-else class="graph-artifact-error" role="alert">
                <LucideTriangleAlert class="size-4 shrink-0" />
                <span>Grafen kunde inte visas. {{ segment.message }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div ref="contentEndMarker" class="h-px w-full" />
      <div class="h-32 w-full shrink-0" />
    </div>

    <SelectionPopover
      v-if="enableSelectionPopover"
      :visible="selectionPopover.visible"
      :x="selectionPopover.x"
      :y="selectionPopover.y"
      @reply="handleReplyToSelection"
    />
  </div>
</template>

<style>
@import "katex/dist/katex.min.css";
</style>

<style scoped>
.prose {
  --tw-prose-hr: var(--border);
  --tw-prose-quote-borders: var(--border);
  --tw-prose-th-borders: var(--border);
  --tw-prose-td-borders: var(--border);
  --tw-prose-invert-hr: var(--border);
  --tw-prose-invert-quote-borders: var(--border);
  --tw-prose-invert-th-borders: var(--border);
  --tw-prose-invert-td-borders: var(--border);
}

.assistant-segments > :first-child {
  margin-top: 0;
}

.assistant-segments > :last-child {
  margin-bottom: 0;
}

.graph-artifact-status,
.graph-artifact-error {
  margin: 1.25rem 0;
  padding: 1rem 1.25rem;
  border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
  border-radius: 1.25rem;
  font-size: 0.875rem;
}

.graph-artifact-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--destructive);
}

.prose :deep(.katex-display) {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  max-width: 100%;
  padding: 0.5rem 0;
  margin: 0.75rem 0;
}

.prose :deep(.katex-display) > .katex {
  width: max-content;
  min-width: 100%;
  max-width: none;
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

.prose :deep(.table-scroll) {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  margin: 2em 0;
}

.attachment-context-item {
  animation: attachment-context-in 180ms var(--ease-spring) both;
}

@keyframes attachment-context-in {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .attachment-context-item {
    animation: none;
  }
}

.prose :deep(.table-scroll table) {
  width: 100%;
  min-width: max-content;
  margin: 0;
  table-layout: auto;
}

.prose :deep(.table-scroll)::-webkit-scrollbar {
  height: 4px;
}

.prose :deep(.table-scroll)::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(.table-scroll)::-webkit-scrollbar-track {
  background: transparent;
}

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
  border-bottom: 1px solid
    color-mix(in oklch, var(--foreground) 8%, transparent);
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

.dark .prose :deep(.code-block pre.shiki),
.dim .prose :deep(.code-block pre.shiki) {
  background-color: var(--shiki-dark-bg);
}

.dark .prose :deep(.code-block pre.shiki span),
.dim .prose :deep(.code-block pre.shiki span) {
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
</style>
