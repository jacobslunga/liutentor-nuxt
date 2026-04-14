<script setup lang="ts">
import type { StoredQuizItem } from "@/types/quiz";

const props = defineProps<{
  courseCode: string;
  stage: "setup" | "generating" | "answering" | "results";
  history: StoredQuizItem[];
  activeQuizId: string | null;
}>();

const emit = defineEmits<{
  loadHistory: [id: string];
  newQuiz: [];
}>();

const isHistoryOpen = ref(false);

const historyOptions = computed(() =>
  props.history.map((item) => ({
    id: item.id,
    label: new Date(item.createdAt).toLocaleString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    questionCount: item.data.quiz.questions.length,
  })),
);
</script>

<template>
  <div
    class="sticky top-0 z-40 flex items-center justify-between bg-linear-to-b from-background to-transparent px-4 py-2"
  >
    <ButtonGroup>
      <Button
        variant="outline"
        size="sm"
        class="gap-1.5 border-border/50 shadow-none text-xs"
        as-child
      >
        <NuxtLink :to="`/search/${courseCode}`">
          <LucideArrowLeft class="h-3.5 w-3.5" />
          Tentor
        </NuxtLink>
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="border-border/50 shadow-none text-xs font-semibold"
        disabled
      >
        {{ courseCode }}
      </Button>
    </ButtonGroup>

    <ButtonGroup>
      <DropdownMenu v-model:open="isHistoryOpen">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="gap-1.5 border-border/50 shadow-none text-xs"
            :disabled="history.length === 0"
          >
            Historik
            <LucideChevronDown
              class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200"
              :class="{ 'rotate-180': isHistoryOpen }"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" :side-offset="8" class="w-64">
          <p
            v-if="history.length === 0"
            class="px-3 py-2 text-xs text-muted-foreground"
          >
            Inga sparade quiz
          </p>
          <DropdownMenuItem
            v-for="item in historyOptions"
            :key="item.id"
            class="flex items-center justify-between text-xs cursor-pointer"
            :class="
              item.id === activeQuizId ? 'text-foreground font-medium' : ''
            "
            @click="emit('loadHistory', item.id)"
          >
            <span>{{ item.label }}</span>
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground"
                >{{ item.questionCount }}q</span
              >
              <LucideCheck
                v-if="item.id === activeQuizId"
                class="h-3.5 w-3.5"
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        class="gap-1.5 border-border/50 shadow-none text-xs"
        :disabled="stage === 'generating'"
        @click="emit('newQuiz')"
      >
        <LucideRefreshCw
          class="h-3.5 w-3.5"
          :class="stage === 'generating' ? 'animate-spin' : ''"
        />
        Nytt quiz
      </Button>
    </ButtonGroup>
  </div>
</template>
