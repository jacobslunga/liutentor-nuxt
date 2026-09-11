<script setup lang="ts">
import type { Message, MessageSource } from "@/stores/chat";
import {
  initChatMarkdown,
  isChatMarkdownReady,
  renderChatMarkdown,
  renderCachedChatMarkdown,
} from "@/lib/chat-markdown";
import { getSkillById } from "@/lib/chat-skills";

const props = withDefaults(
  defineProps<{
    messages: Message[];
    isLoading: boolean;
    contentClass?: string;
    enableSelectionPopover?: boolean;
  }>(),
  { contentClass: "", enableSelectionPopover: true },
);

const emit = defineEmits<{
  replyToSelection: [text: string];
}>();

const chatStore = useChatStore();

const mdReady = ref(isChatMarkdownReady());

initChatMarkdown()
  .catch((error) => {
    console.error("[chat] markdown failed to initialise", error);
  })
  .finally(() => {
    // Unblock rendering either way: on failure renderChatMarkdown falls back to
    // the raw message text, which beats leaving every reply blank.
    mdReady.value = true;
    if (
      chatStore.savedScrollPosition === 0 &&
      props.messages.length > 0 &&
      !props.isLoading
    ) {
      nextTick(() => scrollToBottom("auto"));
    }
  });

const rootRef = ref<HTMLElement | null>(null);
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

const isMounted = ref(false);

/**
 * UChatMessages arbetar med AI SDK:ns meddelandeform. Butiken har en egen, så
 * varje meddelande får ett stabilt id och en text-part — resten av innehållet
 * ritas i slottarna nedan och läses direkt från originalmeddelandet.
 */
const uiMessages = computed(() =>
  props.messages
    .map((message, index) => ({
      id: `msg-${index}`,
      role: message.role,
      parts:
        message.role === "user"
          ? [{ type: "text" as const, text: message.content || " " }]
          : message.content
            ? [{ type: "text" as const, text: message.content }]
            : [],
      original: message,
      index,
    }))
    // useChat lägger till ett tomt assistentsvar redan när turen startar. Tas
    // det med blir det sista meddelandet aldrig användarens, och UChatMessages
    // hoppar då över rullningen som ger plats åt svaret.
    .filter((message, i, all) => message.parts.length || i !== all.length - 1),
);

/** Status i AI SDK:ns termer, vilket styr autoscroll och skrivindikatorn. */
const status = computed(() => {
  if (!isMounted.value || !props.isLoading) return "ready" as const;
  const last = props.messages.at(-1);
  if (last?.role === "user" || (last?.role === "assistant" && !last.content)) {
    return "submitted" as const;
  }
  return "streaming" as const;
});

/**
 * A bare hostname reads better in a chip than a page title that will be clipped
 * anyway — the title stays available on hover. Gemini is the exception: it hands
 * back an opaque grounding-redirect URL whose host says nothing, and puts the
 * real domain in the title instead.
 */
const OPAQUE_SOURCE_HOSTS = ["vertexaisearch.cloud.google.com"];

function sourceLabel(source: MessageSource): string {
  try {
    const host = new URL(source.url).hostname.replace(/^www\./, "");
    if (OPAQUE_SOURCE_HOSTS.includes(host)) return source.title || host;
    return host;
  } catch {
    return source.title || source.url;
  }
}

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

/** Rullningsytan ägs av UChatPalette, så den slås upp från rot-elementet. */
function scrollParent(): HTMLElement | null {
  const root = (rootRef.value as any)?.$el ?? rootRef.value;
  let el = (root instanceof HTMLElement ? root.parentElement : null) ?? null;
  while (el) {
    if (/auto|scroll/.test(getComputedStyle(el).overflowY)) return el;
    el = el.parentElement;
  }
  return null;
}

function handleMessageMouseUp() {
  if (!props.enableSelectionPopover) return;
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (!text || !selection?.rangeCount) {
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
    selectionPopoverScrollAnchor.value = scrollParent()?.scrollTop ?? 0;
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

const renderedAssistantHtml = computed<string[]>(() => {
  if (!mdReady.value) return props.messages.map(() => "");
  const lastIndex = props.messages.length - 1;
  return props.messages.map((msg, i) => {
    if (msg.role !== "assistant" || !msg.content) return "";
    return props.isLoading && i === lastIndex
      ? renderChatMarkdown(msg.content)
      : renderCachedChatMarkdown(msg.content);
  });
});

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  const el = scrollParent();
  if (!el) return;
  if (behavior === "auto") {
    el.scrollTop = el.scrollHeight;
  } else {
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }
}

function persistScrollPosition() {
  chatStore.savedScrollPosition = scrollParent()?.scrollTop ?? 0;
}

function handleScroll() {
  if (!selectionPopover.value.visible) return;
  const el = scrollParent();
  if (!el) return;
  if (Math.abs(el.scrollTop - selectionPopoverScrollAnchor.value) > 80) {
    selectionPopover.value.visible = false;
  }
}

function restoreScroll() {
  const el = scrollParent();
  if (!el) return;
  if (chatStore.savedScrollPosition > 0) {
    el.scrollTop = chatStore.savedScrollPosition;
  } else {
    scrollToBottom("auto");
    requestAnimationFrame(() => scrollToBottom("auto"));
  }
}

function resetScrollState() {
  chatStore.savedScrollPosition = 0;
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

function updateLastMessageHeight() {
  const root = (rootRef.value as any)?.$el ?? rootRef.value;
  const parent = scrollParent();
  if (!root || !parent) return;
  const userArticles = root.querySelectorAll('article[data-role="user"]');
  const lastUserArticle = userArticles[userArticles.length - 1] as HTMLElement | undefined;
  if (!lastUserArticle) return;

  const parentHeight = parent.clientHeight;
  const userHeight = lastUserArticle.offsetHeight;
  const rootStyle = window.getComputedStyle(root);
  const gap = Number.parseFloat(rootStyle.rowGap) || Number.parseFloat(rootStyle.gap) || 0;
  const lastMessageHeight = Math.max(parentHeight - userHeight - gap - 40, 0);
  root.style.setProperty("--last-message-height", `${lastMessageHeight}px`);
}

function scrollUserMessageToTop() {
  const userMessages = props.messages.filter((m) => m.role === "user");
  if (userMessages.length <= 1) {
    const parent = scrollParent();
    if (parent) {
      parent.scrollTop = 0;
    }
    return;
  }

  nextTick(() => {
    updateLastMessageHeight();
    const root = (rootRef.value as any)?.$el ?? rootRef.value;
    if (!root) return;
    const userArticles = root.querySelectorAll('article[data-role="user"]');
    const lastUserArticle = userArticles[userArticles.length - 1] as HTMLElement | undefined;
    if (lastUserArticle) {
      lastUserArticle.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

let detachScroll: (() => void) | undefined;

onMounted(() => {
  if (props.enableSelectionPopover) {
    document.addEventListener("selectionchange", handleSelectionChange);
  }
  const el = scrollParent();
  el?.addEventListener("scroll", handleScroll, { passive: true });
  detachScroll = () => el?.removeEventListener("scroll", handleScroll);

  nextTick(() => {
    isMounted.value = true;
  });

  if (props.isLoading) {
    nextTick(() => {
      scrollUserMessageToTop();
    });
  } else if (props.messages.length > 0) {
    restoreScroll();
  }
});

onUnmounted(() => {
  if (props.enableSelectionPopover) {
    document.removeEventListener("selectionchange", handleSelectionChange);
  }
  detachScroll?.();
  persistScrollPosition();
});

defineExpose({
  scrollToBottom,
  scrollUserMessageToTop,
  restoreScroll,
  persistScrollPosition,
  resetScrollState,
});
</script>

<template>
  <UChatMessages
    ref="rootRef"
    :messages="uiMessages"
    :status="status"
    :auto-scroll="false"
    :should-scroll-to-bottom="false"
    :ui="{
      root: 'w-full min-w-0 max-w-full flex flex-col gap-1 flex-1 px-2.5 [&>article]:last-of-type:min-h-(--last-message-height)',
      viewport: 'hidden',
    }"
    :user="{
      side: 'right',
      variant: 'naked',
      ui: {
        root: 'scroll-mt-20 sm:scroll-mt-20 min-w-0 max-w-full',
        container: 'justify-end ms-auto max-w-[85%] sm:max-w-[75%] min-w-0',
      },
    }"
    :assistant="{
      side: 'left',
      variant: 'naked',
      ui: {
        root: 'min-w-0 max-w-full overflow-hidden',
        container: 'w-full pb-8 min-w-0 max-w-full overflow-hidden',
        body: 'w-full min-w-0 max-w-full overflow-hidden',
        content: 'w-full min-w-0 max-w-full overflow-hidden',
      },
    }"
    :class="contentClass"
    class="mx-auto w-full max-w-2xl 3xl:max-w-3xl min-w-0"
    @mouseup="handleMessageMouseUp"
    @click="handleCodeCopy"
  >
    <template #content="{ message }">
      <div
        v-if="message.role === 'user'"
        class="flex flex-col items-start gap-2 rounded-2xl bg-elevated px-4 py-3 text-highlighted shadow-xs"
      >
        <div
          v-if="message.original.selectionContext"
          class="border-l-2 border-inverted/30 pl-3 text-sm italic text-muted line-clamp-3"
        >
          "{{ message.original.selectionContext }}"
        </div>

        <div
          v-if="message.original.attachments?.length"
          class="flex flex-wrap gap-1.5"
        >
          <div
            v-for="attachment in message.original.attachments"
            :key="attachment.id"
            class="attachment-context-item flex min-w-0 max-w-full items-center gap-1.5 rounded-lg border border-default bg-default px-2.5 py-1.5 text-xs"
            :class="attachment.active
              ? ''
              : 'text-muted opacity-70'"
          >
            <UIcon
              v-if="attachment.mediaType === 'application/pdf'"
              name="i-lucide-file-text"
              class="size-3.5 shrink-0 text-muted"
            />
            <img
              v-else-if="attachment.previewUrl"
              :src="attachment.previewUrl"
              alt=""
              class="size-14 shrink-0 rounded-md object-cover"
            />
            <UIcon v-else name="i-lucide-image" class="size-3.5 shrink-0 text-muted" />
            <span class="max-w-28 truncate" :title="attachment.name">
              {{ attachment.name }}
            </span>
            <span class="shrink-0 text-muted">
              {{ formatFileSize(attachment.size) }}
            </span>
          </div>
        </div>

        <UBadge
          v-if="message.original.skill"
          color="primary"
          variant="solid"
          size="sm"
          :label="getSkillById(message.original.skill)?.label"
        />

        <p
          v-if="message.original.content"
          class="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-highlighted"
        >
          {{ message.original.content }}
        </p>
      </div>

      <div v-else data-role="assistant" class="w-full min-w-0">
        <div
          v-if="
            message.original.status?.message ||
            (!message.original.content && isLoading && message.index === messages.length - 1)
          "
          class="mb-2 flex h-6 items-center gap-2"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="variable-spin size-4 text-muted"
          />
          <span class="shimmer-text text-sm">
            {{ message.original.status?.message || loadingPhrase }}
          </span>
        </div>

        <div
          v-if="renderedAssistantHtml[message.index]"
          class="prose 3xl:prose-lg min-w-0 max-w-none w-full prose-headings:font-semibold prose-strong:font-semibold dark:prose-invert marker:font-semibold marker:text-highlighted"
          v-html="renderedAssistantHtml[message.index]"
        />

        <div
          v-if="message.original.sources?.length"
          class="mt-3 flex flex-wrap gap-1.5"
        >
          <UButton
            v-for="source in message.original.sources"
            :key="source.url"
            :to="source.url"
            target="_blank"
            rel="noopener noreferrer"
            :title="source.title"
            color="neutral"
            variant="outline"
            size="xs"
            icon="i-lucide-globe"
            :label="sourceLabel(source)"
            class="max-w-56"
          />
        </div>
      </div>
    </template>

    <template #indicator>
      <div class="flex h-6 items-center gap-2">
        <UIcon
          name="i-lucide-loader-circle"
          class="variable-spin size-4 text-muted"
        />
        <span class="shimmer-text text-sm">
          {{ messages.at(-1)?.status?.message || loadingPhrase }}
        </span>
      </div>
    </template>
  </UChatMessages>

  <SelectionPopover
    v-if="enableSelectionPopover"
    :visible="selectionPopover.visible"
    :x="selectionPopover.x"
    :y="selectionPopover.y"
    @reply="handleReplyToSelection"
  />
</template>

<style>
@import "katex/dist/katex.min.css";
</style>

<style scoped>
.prose {
  --tw-prose-body: var(--ui-text);
  --tw-prose-headings: var(--ui-text-highlighted);
  --tw-prose-lead: var(--ui-text-toned);
  --tw-prose-links: var(--ui-text-highlighted);
  --tw-prose-bold: var(--ui-text-highlighted);
  --tw-prose-counters: var(--ui-text-muted);
  --tw-prose-bullets: var(--ui-text-muted);
  --tw-prose-quotes: var(--ui-text-highlighted);
  --tw-prose-quote-borders: var(--ui-border-accented);
  --tw-prose-captions: var(--ui-text-muted);
  --tw-prose-kbd: var(--ui-text-highlighted);
  --tw-prose-kbd-shadows: var(--ui-border);
  --tw-prose-code: var(--ui-text-highlighted);
  --tw-prose-pre-code: var(--ui-text);
  --tw-prose-pre-bg: var(--ui-bg-muted);
  --tw-prose-hr: var(--ui-border);
  --tw-prose-th-borders: var(--ui-border);
  --tw-prose-td-borders: var(--ui-border);
  --tw-prose-invert-body: var(--ui-text);
  --tw-prose-invert-headings: var(--ui-text-highlighted);
  --tw-prose-invert-lead: var(--ui-text-toned);
  --tw-prose-invert-links: var(--ui-text-highlighted);
  --tw-prose-invert-bold: var(--ui-text-highlighted);
  --tw-prose-invert-counters: var(--ui-text-muted);
  --tw-prose-invert-bullets: var(--ui-text-muted);
  --tw-prose-invert-quotes: var(--ui-text-highlighted);
  --tw-prose-invert-quote-borders: var(--ui-border-accented);
  --tw-prose-invert-captions: var(--ui-text-muted);
  --tw-prose-invert-kbd: var(--ui-text-highlighted);
  --tw-prose-invert-kbd-shadows: var(--ui-border);
  --tw-prose-invert-code: var(--ui-text-highlighted);
  --tw-prose-invert-pre-code: var(--ui-text);
  --tw-prose-invert-pre-bg: var(--ui-bg-muted);
  --tw-prose-invert-hr: var(--ui-border);
  --tw-prose-invert-th-borders: var(--ui-border);
  --tw-prose-invert-td-borders: var(--ui-border);
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

.prose :deep(.katex-display)>.katex {
  width: max-content;
  min-width: 100%;
  max-width: none;
}

.prose :deep(.katex) {
  max-width: 100%;
  white-space: nowrap;
}

/*
 * Inline math (`$…$`) lands in an <eq> inside the paragraph. KaTeX never wraps
 * it, so a long expression would push the whole chat sideways. inline-flex
 * keeps the text baseline (inline-block would drop it to the bottom edge once
 * overflow is set) while giving the expression its own horizontal scroll.
 */
.prose :deep(eq) {
  display: inline-flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.prose :deep(eq)::-webkit-scrollbar {
  display: none;
}

.prose :deep(eq > .katex) {
  flex: none;
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
  background: color-mix(in oklch, var(--ui-text-muted) 30%, transparent);
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
  background: color-mix(in oklch, var(--ui-text-muted) 30%, transparent);
  border-radius: 2px;
}

.prose :deep(.katex-display)::-webkit-scrollbar-track {
  background: transparent;
}

.prose :deep(.code-block) {
  margin: 1.25rem 0;
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  overflow: hidden;
}

.prose :deep(.code-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem 0.4rem 1rem;
  background-color: var(--ui-bg-muted);
  border-bottom: 1px solid var(--ui-border);
}

.prose :deep(.code-lang) {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  color: var(--ui-text-muted);
}

.prose :deep(.code-copy:hover) {
  background-color: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
}

.prose :deep(.code-copy.copied) {
  color: var(--ui-primary);
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
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  color: var(--ui-text-muted);
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
