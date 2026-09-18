<script setup lang="ts">
import {
  initChatMarkdown,
  isChatMarkdownReady,
  renderCachedChatMarkdown,
} from "@/lib/chat-markdown";

const props = defineProps<{ text: string }>();

const mdReady = ref(isChatMarkdownReady());
initChatMarkdown().then(
  () => (mdReady.value = true),
  () => (mdReady.value = true),
);

const html = computed(() =>
  mdReady.value ? renderCachedChatMarkdown(props.text) : "",
);
</script>

<template>
  <span v-if="html" class="selection-quote" v-html="html" />
  <span v-else class="selection-quote">{{ text }}</span>
</template>

<style>
@import "katex/dist/katex.min.css";
</style>

<style scoped>
/* Quote reads as one run of text: block elements collapse inline. */
.selection-quote :deep(p),
.selection-quote :deep(li),
.selection-quote :deep(section),
.selection-quote :deep(h1),
.selection-quote :deep(h2),
.selection-quote :deep(h3),
.selection-quote :deep(h4) {
  display: inline;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
.selection-quote :deep(p + p)::before,
.selection-quote :deep(li + li)::before {
  content: " ";
}
.selection-quote :deep(.katex-display) {
  display: inline;
  margin: 0;
}
.selection-quote :deep(.katex-display > .katex) {
  display: inline;
  text-align: inherit;
}
.selection-quote :deep(.katex) {
  font-size: 1em;
}
.selection-quote :deep(pre) {
  display: inline;
  white-space: pre-wrap;
}
.selection-quote :deep(.code-header) {
  display: none;
}
</style>
