<script setup lang="ts">
import { formatPuzzleDate } from "#shared/utils/dailyCourse";
import { ROW_REVEAL_MS } from "~/lib/daily-timing";
import { toast } from "vue-sonner";

definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Dagens kurskod",
  description:
    "Gissa dagens kurskod på sex försök. En ny kod varje dag, samma för alla.",
  ogTitle: "Dagens kurskod – LiU Tentor",
  ogDescription:
    "Gissa dagens kurskod på sex försök. En ny kod varje dag, samma för alla.",
});

const puzzle = useDailyPuzzle();

const {
  date,
  rows,
  current,
  status,
  answer,
  courseName,
  stats,
  loading,
  submitting,
  message,
  shaking,
  revealingRow,
  failed,
  finished,
  keyStates,
} = puzzle;

// The result replaces the keyboard, but only after the final row has finished
// flipping — otherwise the answer appears before the tiles resolve.
const showResult = ref(false);

watch(finished, (value) => {
  if (!value) {
    showResult.value = false;
    return;
  }
  setTimeout(
    () => (showResult.value = true),
    revealingRow.value === null ? 0 : ROW_REVEAL_MS + 200,
  );
});

async function share() {
  const text = puzzle.shareText();

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // Cancelled, or unavailable here — fall through to the clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Resultatet kopierat");
  } catch {
    toast.error("Kunde inte kopiera resultatet");
  }
}

onMounted(() => puzzle.load());
</script>

<template>
  <div
    class="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-6"
  >
    <div class="flex flex-col items-center gap-0.5 text-center">
      <h1 class="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Dagens kurskod
      </h1>
      <p class="text-sm text-muted-foreground">
        <template v-if="date">
          {{ formatPuzzleDate(date) }} · samma kod för alla
        </template>
        <template v-else>Laddar…</template>
      </p>
    </div>

    <div v-if="loading" class="py-20 text-sm text-muted-foreground">
      Laddar dagens kurskod…
    </div>

    <div
      v-else-if="failed"
      class="flex flex-col items-center gap-3 py-20 text-center"
    >
      <p class="text-sm text-muted-foreground">
        Kunde inte hämta dagens kurskod.
      </p>
      <Button variant="outline" @click="puzzle.load()">Försök igen</Button>
    </div>

    <template v-else>
      <p class="h-5 text-center text-sm text-muted-foreground">
        {{ message || (showResult ? "" : "Gissa kurskoden på sex försök") }}
      </p>

      <DailyGameBoard
        :rows="rows"
        :current="current"
        :revealing-row="revealingRow"
        :shaking="shaking"
        :finished="showResult"
      />

      <DailyGameResult
        v-if="showResult"
        :status="status"
        :answer="answer"
        :course-name="courseName"
        :attempts="rows.length"
        :stats="stats"
        @share="share"
      />
      <DailyGameKeyboard
        v-else
        :key-states="keyStates"
        :disabled="submitting || finished"
        @type="puzzle.type"
        @backspace="puzzle.backspace"
        @submit="puzzle.submit"
      />
    </template>
  </div>
</template>
