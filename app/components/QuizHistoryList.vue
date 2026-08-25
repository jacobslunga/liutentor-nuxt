<script setup lang="ts">
import type { QuizDifficulty, StoredQuizItem } from "@/types/quiz";

const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  easy: "Lätt",
  medium: "Medel",
  hard: "Svår",
};

const props = defineProps<{
  history: StoredQuizItem[];
  historyEnabled: boolean;
  activeQuizId: string | null;
}>();

const emit = defineEmits<{
  loadHistory: [id: string];
  deleteHistory: [id: string];
}>();

// Open state is tracked separately from the target id: AlertDialogAction runs
// its own close handler on click, which can fire before ours, so deriving the
// target from the open state would clear it before we get to read it.
const isDeleteDialogOpen = ref(false);
const deleteTargetId = ref<string | null>(null);

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
    difficultyLabel: item.data.meta?.difficulty
      ? DIFFICULTY_LABELS[item.data.meta.difficulty]
      : null,
  })),
);

const pendingLabel = computed(
  () => historyItems.value.find((i) => i.id === deleteTargetId.value)?.label,
);

function requestDelete(id: string) {
  deleteTargetId.value = id;
  isDeleteDialogOpen.value = true;
}

function confirmDelete() {
  const id = deleteTargetId.value;
  if (id) emit("deleteHistory", id);
  isDeleteDialogOpen.value = false;
  deleteTargetId.value = null;
}
</script>

<template>
  <section class="mt-10 w-full">
    <div class="flex items-center justify-between border-b border-border/60 pb-2">
      <p class="text-xs font-medium text-muted-foreground">Tidigare quiz</p>
      <span
        v-if="historyEnabled && historyItems.length > 0"
        class="text-xs tabular-nums text-muted-foreground/60"
      >
        {{ historyItems.length }}
      </span>
    </div>

    <p v-if="!historyEnabled" class="pt-4 text-sm text-muted-foreground">
      Logga in för att se tidigare quiz.
    </p>
    <p
      v-else-if="historyItems.length === 0"
      class="pt-4 text-sm text-muted-foreground"
    >
      Inga sparade quiz än.
    </p>

    <div v-else class="flex flex-col">
      <div
        v-for="item in historyItems"
        :key="item.id"
        class="group flex items-center gap-2 border-b border-border/60 last:border-b-0"
        :class="item.id === activeQuizId ? 'bg-muted/40' : ''"
      >
        <Button
          variant="ghost"
          class="h-auto min-w-0 flex-1 justify-start rounded-none px-2 py-3 text-left hover:bg-transparent"
          @click="emit('loadHistory', item.id)"
        >
          <span class="min-w-0 flex-1 truncate text-sm font-medium">
            {{ item.label }}
          </span>
          <span class="shrink-0 text-xs text-muted-foreground">
            <span v-if="item.difficultyLabel">
              {{ item.difficultyLabel }} ·
            </span>
            {{ item.questionCount }} frågor
            <span v-if="item.sourceCount">· {{ item.sourceCount }} tentor</span>
          </span>
          <LucideCheck
            v-if="item.id === activeQuizId"
            class="h-4 w-4 shrink-0 text-primary"
          />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="shrink-0 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          :aria-label="`Ta bort quiz från ${item.label}`"
          @click="requestDelete(item.id)"
        >
          <LucideTrash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ta bort quizet?</AlertDialogTitle>
          <AlertDialogDescription>
            Quizet från {{ pendingLabel }} tas bort permanent. Det går inte att
            ångra.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
            @click="confirmDelete"
          >
            Ta bort
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
