<script setup lang="ts">
import {
  MAX_GUESSES,
  WORD_LENGTH,
  stockholmDate,
  type TileState,
} from "#shared/utils/dailyCourse";
import { readBoard } from "~/lib/daily-storage";

// State comes from localStorage plus today's date, so the button costs no
// request. The date is the same key the server uses, so the two agree without
// having to ask.
const isMounted = useIsMounted();

const tiles = ref<(TileState | null)[]>(Array(WORD_LENGTH).fill(null));
const attempts = ref(0);
const status = ref<"playing" | "won" | "lost">("playing");

onMounted(() => {
  const today = stockholmDate();

  const board = readBoard();
  if (board?.date !== today || !board?.rows?.length) return;

  status.value = board.status;
  attempts.value = board.rows.length;

  // Show the row that tells the story: the winning one, or the last attempt.
  const row = board.rows[board.rows.length - 1];
  if (row) tiles.value = row.result;
});

const finished = computed(() => status.value !== "playing");

const TILE_CLASSES: Record<TileState, string> = {
  correct: "bg-success",
  present: "bg-warning",
  // Not the board's --tile-absent: these tiles sit on the button's tinted
  // surface rather than the page background, and that token is close enough to
  // it in dark mode that ruled-out squares disappear and the row reads as gaps.
  // A tint of the foreground stays visible against either surface.
  absent: "bg-foreground/25",
};
</script>

<template>
  <NuxtLink
    to="/dagens-kurskod"
    class="group inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-secondary/40 pr-3 pl-2 text-xs text-muted-foreground transition-colors duration-150 ease-spring hover:border-foreground/40 hover:text-foreground active:scale-[0.98]"
  >
    <span class="flex flex-row gap-[2px]" aria-hidden="true">
      <span
        v-for="(tile, i) in tiles"
        :key="i"
        class="size-2 rounded-[2px] transition-colors duration-150 ease-spring"
        :class="isMounted && tile ? TILE_CLASSES[tile] : 'bg-foreground/15'"
      />
    </span>

    <span>Dagens kurskod</span>

    <span
      v-if="isMounted && finished"
      class="rounded-sm bg-primary/10 px-1.5 font-mono text-2xs font-semibold text-primary"
    >
      {{ status === "won" ? `${attempts}/${MAX_GUESSES}` : `X/${MAX_GUESSES}` }}
    </span>
  </NuxtLink>
</template>
