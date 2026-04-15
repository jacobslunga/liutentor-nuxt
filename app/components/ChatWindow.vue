<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import MarkdownIt from "markdown-it";
import markdownItKatex from "@vscode/markdown-it-katex";
import DOMPurify from "dompurify";
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
const { messages, isLoading, draftInput } = storeToRefs(chatStore);

const { send, cancelGeneration } = useChat({
  examId: props.examId,
  examUrl: props.examUrl,
  courseCode: props.courseCode,
  solutionUrl: props.solutionUrl,
});

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
md.use(markdownItKatex, { throwOnError: false });

const MAX_RENDER_CACHE = 200;
const renderCache = new Map<string, string>();

function normalizeLatexDelimiters(content: string): string {
  // Replace \[...\] display math with $$...$$
  content = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_m, inner) => `$$${inner}$$`,
  );
  // Replace \(...\) inline math with $...$
  content = content.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner}$`);
  // Downgrade $$...$$ that has trailing text on the same line to inline $...$
  // (display math must be on its own line; mixed-line $$ confuses the parser)
  content = content.replace(
    /\$\$([\s\S]*?)\$\$([^\n$])/g,
    (_, inner, charAfter) => `$${inner.trim()}$${charAfter}`,
  );
  return content;
}

function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(md.render(normalizeLatexDelimiters(content)), {
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
    ADD_ATTR: ["xmlns", "encoding"],
  });
}

function getCachedMarkdown(content: string): string {
  const cached = renderCache.get(content);
  if (cached) return cached;

  const rendered = renderMarkdown(content);
  renderCache.set(content, rendered);

  if (renderCache.size > MAX_RENDER_CACHE) {
    const oldestKey = renderCache.keys().next().value;
    if (oldestKey) renderCache.delete(oldestKey);
  }

  return rendered;
}

const giveDirectAnswer = ref(true);
const { selectedModelId } = useSelectedModel();
const messagesEndRef = ref<HTMLDivElement | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);
const chatInputRef = ref<{ focus: () => void } | null>(null);
const isUserScrolling = ref(false);

const isAtBottom = ref(true);
const showScrollButton = ref(false);

const renderedAssistantHtml = computed(() => {
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
  if (!messagesEndRef.value) return;

  const container = messagesContainer.value;
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }
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
    if (isAtBottom.value) {
      nextTick(() => scrollToBottom("auto"));
    }
  },
  { deep: true },
);

onMounted(() => {
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

function handleKeyUp(e: KeyboardEvent) {
  const key = e.key;
  const isEscape = key === "Escape";

  if (isEscape && chatStore.isOpen) {
    chatStore.close();
    return;
  }
}

onMounted(() => {
  document.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener("keyup", handleKeyUp);
});

defineExpose({ focusInput: () => chatInputRef.value?.focus() });
</script>

<template>
  <div
    class="h-full w-full flex flex-col border-l bg-background overflow-hidden relative z-50"
  >
    <ChatHeader :has-solution="hasSolution" @close="emit('close')" />

    <div class="flex-1 min-h-0 relative">
      <div
        ref="messagesContainer"
        class="h-full w-full overflow-y-auto px-4 pt-4 custom-scrollbar"
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
            to="/privacy-policy"
            target="_blank"
            class="text-[11px] text-muted-foreground/60 hover:text-foreground transition-all duration-200 border-b border-transparent hover:border-foreground/30 pb-0.5"
          >
            Läs vår AI-policy
          </NuxtLink>
        </div>

        <div v-else class="space-y-6 max-w-2xl mx-auto w-full">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="msg.role === 'user' ? 'flex justify-end' : ''"
            v-memo="[
              msg.role,
              msg.content,
              isLoading && i === messages.length - 1,
            ]"
          >
            <div
              v-if="msg.role === 'user'"
              class="bg-muted text-foreground px-4 py-2.5 rounded-2xl max-w-[85%] w-fit"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap">
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
                class="prose prose-sm dark:prose-invert max-w-none"
                v-html="renderedAssistantHtml[i]"
              />
            </div>
          </div>

          <div ref="messagesEndRef" class="h-px w-full" />
          <div class="h-32 w-full shrink-0" />
        </div>
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 pt-10 pb-4 bg-linear-to-t from-background via-background/95 to-transparent pointer-events-none z-10"
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
</template>
