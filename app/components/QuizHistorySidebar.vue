<script setup lang="ts">
import type { StoredQuizItem } from "@/types/quiz";

const props = defineProps<{
  history: StoredQuizItem[];
  historyEnabled: boolean;
  activeQuizId: string | null;
}>();

const emit = defineEmits<{
  loadHistory: [id: string];
}>();

const historyItems = computed(() =>
  props.history.map((item) => ({
    id: item.id,
    label: new Date(item.createdAt).toLocaleString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    questionCount: item.data.quiz.questions.length,
    sourceCount: item.data.meta?.sourceCount ?? 0,
  })),
);
</script>

<template>
  <aside class="hidden lg:block">
    <div class="sticky top-16">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-xs font-medium text-muted-foreground">Tidigare quiz</p>
        <span v-if="historyEnabled" class="text-xs tabular-nums text-muted-foreground/60">
          {{ history.length }}
        </span>
      </div>

      <div class="max-h-[calc(100vh-7rem)] overflow-y-auto border-l border-border/60 pl-3">
        <p v-if="!historyEnabled"
          class="rounded-md border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
          Logga in för att se tidigare quiz.
        </p>
        <p v-else-if="historyItems.length === 0"
          class="rounded-md border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
          Inga sparade quiz än.
        </p>

        <div v-else class="flex flex-col gap-2">
          <button v-for="item in historyItems" :key="item.id" type="button"
            class="group cursor-pointer w-full rounded-md border px-3 py-3 text-left transition-colors" :class="item.id === activeQuizId
              ? 'border-primary/40 bg-primary/5'
              : 'border-border/50 hover:border-border hover:bg-muted/30'
              " @click="emit('loadHistory', item.id)">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ item.label }}</p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ item.questionCount }} frågor
                  <span v-if="item.sourceCount">
                    · {{ item.sourceCount }} tentor</span>
                </p>
              </div>
              <LucideCheck v-if="item.id === activeQuizId" class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <LucideArrowForward v-else
                class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>
