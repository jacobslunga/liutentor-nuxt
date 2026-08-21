<script setup lang="ts">
import { MAX_GUESSES, WORD_LENGTH, type GuessRow } from "#shared/utils/dailyCourse";
import { FLIP_MS, STAGGER_MS } from "~/lib/daily-timing";

const props = defineProps<{
  rows: GuessRow[];
  current: string;
  revealingRow: number | null;
  shaking: boolean;
  finished: boolean;
}>();

const TILE_CLASSES = {
  correct: "border-transparent bg-success text-success-foreground",
  present: "border-transparent bg-warning text-warning-foreground",
  absent: "border-transparent bg-tile-absent text-tile-absent-foreground",
} as const;

/**
 * How many tiles of the row currently flipping have passed their halfway point.
 *
 * A tile is edge-on at the midpoint of its flip, which is the only moment its
 * colour can change without the change being visible. Colouring the whole row
 * up front — which is what the server response naturally gives you — spoils
 * every tile before it has turned.
 */
const revealedCols = ref(WORD_LENGTH);
let timers: ReturnType<typeof setTimeout>[] = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

watch(
  () => props.revealingRow,
  (row) => {
    clearTimers();

    if (row === null) {
      revealedCols.value = WORD_LENGTH;
      return;
    }

    revealedCols.value = 0;
    for (let col = 0; col < WORD_LENGTH; col++) {
      timers.push(
        setTimeout(
          () => (revealedCols.value = col + 1),
          col * STAGGER_MS + FLIP_MS / 2,
        ),
      );
    }
  },
);

onUnmounted(clearTimers);

// Once the game is over the unplayed rows are just dead space between the
// board and the result, so the grid shrinks to what was actually guessed.
const visibleRows = computed(() =>
  props.finished ? props.rows.length : MAX_GUESSES,
);

const board = computed(() =>
  Array.from({ length: visibleRows.value }, (_, rowIndex) => {
    const row = props.rows[rowIndex];
    const isCurrent = rowIndex === props.rows.length;
    const revealing = rowIndex === props.revealingRow;

    return Array.from({ length: WORD_LENGTH }, (_, col) => ({
      key: `${rowIndex}-${col}`,
      char: row ? row.guess[col] : isCurrent ? (props.current[col] ?? "") : "",
      // Hold the colour back until this tile is edge-on.
      state: !revealing || col < revealedCols.value ? (row?.result[col] ?? null) : null,
      revealing,
      delay: revealing ? col * STAGGER_MS : 0,
      filled: isCurrent && col < props.current.length,
      shake: isCurrent && props.shaking,
    }));
  }),
);
</script>

<template>
  <!-- Tiles are sized off the viewport so the board, keyboard and header all
       fit on a laptop screen without the page scrolling. -->
  <div
    class="flex flex-col items-center gap-1.5 [--tile:clamp(2rem,min(11vw,6.6vh),3rem)]"
  >
    <div
      v-for="(row, rowIndex) in board"
      :key="rowIndex"
      class="flex flex-row gap-1.5"
    >
      <div
        v-for="tile in row"
        :key="tile.key"
        class="flex items-center justify-center rounded-lg border-2 font-mono font-semibold uppercase transition-colors duration-75 ease-spring"
        :class="[
          tile.state
            ? TILE_CLASSES[tile.state]
            : tile.filled
              ? 'border-foreground/40 bg-background text-foreground'
              : 'border-border bg-background text-foreground',
          tile.revealing ? 'daily-tile-flip' : '',
          tile.filled ? 'daily-tile-pop' : '',
          tile.shake ? 'daily-row-shake' : '',
        ]"
        :style="{
          width: 'var(--tile)',
          height: 'var(--tile)',
          fontSize: 'calc(var(--tile) * 0.42)',
          ...(tile.delay ? { animationDelay: `${tile.delay}ms` } : {}),
        }"
      >
        {{ tile.char }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes daily-flip {
  0% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0deg);
  }
}

@keyframes daily-pop {
  0% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes daily-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

.daily-tile-flip {
  animation: daily-flip 360ms ease-in-out both;
}

.daily-tile-pop {
  animation: daily-pop 120ms var(--ease-spring);
}

.daily-row-shake {
  animation: daily-shake 400ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .daily-tile-flip,
  .daily-tile-pop,
  .daily-row-shake {
    animation: none;
  }
}
</style>
