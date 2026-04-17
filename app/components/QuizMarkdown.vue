<script setup lang="ts">
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import katex from "katex";
import DOMPurify from "dompurify";

const props = defineProps<{ content: string }>();

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(texmath, {
  engine: katex,
  delimiters: ["dollars"],
  katexOptions: {
    throwOnError: false,
    errorColor: "inherit",
  },
});

const html = computed(() =>
  DOMPurify.sanitize(md.render(props.content), {
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
  }),
);
</script>

<template>
  <div
    class="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-0 [&>p:last-child]:mb-0"
    v-html="html"
  />
</template>
