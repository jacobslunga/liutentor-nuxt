<script setup lang="ts">
import type { DocSection } from "~/types/doc";

const props = defineProps<{
  sections: DocSection[];
}>();

const entries = computed(() =>
  props.sections.map((section, i) => ({
    ...section,
    id: `sektion-${i + 1}`,
    number: String(i + 1).padStart(2, "0"),
    paragraphs: Array.isArray(section.content) ? section.content : [section.content],
  })),
);

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 sm:px-8">

    <nav aria-label="Innehåll" class="pt-12 sm:pt-16">
      <p class="text-sm font-medium text-muted-foreground">
        Innehåll
      </p>
      <ol class="mt-5 grid gap-x-10 sm:grid-cols-2">
        <li v-for="entry in entries" :key="entry.id">
          <a
            :href="`#${entry.id}`"
            class="group flex items-baseline gap-4 border-b py-3 text-sm text-muted-foreground transition-colors duration-150 ease-spring hover:text-foreground"
            @click.prevent="jumpTo(entry.id)"
          >
            <span class="text-xs tabular-nums text-muted-foreground/60 transition-colors duration-150 ease-spring group-hover:text-primary">
              {{ entry.number }}
            </span>
            <span class="flex-1">{{ entry.title }}</span>
          </a>
        </li>
      </ol>
    </nav>

    <div class="mt-16 sm:mt-24">
      <section
        v-for="entry in entries"
        :id="entry.id"
        :key="entry.id"
        class="grid scroll-mt-24 gap-x-12 gap-y-5 border-t py-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-14"
      >
        <div class="lg:sticky lg:top-24 lg:self-start">
          <span class="text-xs tabular-nums text-primary">{{ entry.number }}</span>
          <h2 class="mt-2 text-lg font-medium leading-snug text-foreground">
            {{ entry.title }}
          </h2>
        </div>

        <div class="max-w-2xl space-y-4">
          <p
            v-for="(paragraph, i) in entry.paragraphs"
            :key="i"
            class="text-[0.9375rem] leading-[1.75] text-foreground/75"
          >
            {{ paragraph }}
          </p>

          <ul v-if="entry.items" class="space-y-2.5 pt-1">
            <li
              v-for="item in entry.items"
              :key="item"
              class="relative pl-6 text-[0.9375rem] leading-[1.7] text-foreground/70 before:absolute before:left-0 before:top-[0.8em] before:h-px before:w-3 before:bg-muted-foreground/40"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </section>
    </div>

    <slot name="footer" />
  </div>
</template>
