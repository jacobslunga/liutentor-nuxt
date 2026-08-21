import {
  MAX_GUESSES,
  WORD_LENGTH,
  buildShareText,
  normalizeGuess,
  previousDay,
  stockholmDate,
  type GameStatus,
  type GuessRow,
  type TileState,
} from "#shared/utils/dailyCourse";

import {
  EMPTY_STATS,
  readBoard,
  readStats,
  writeBoard,
  writeStats,
  type DailyStats,
} from "~/lib/daily-storage";
import { ROW_REVEAL_MS } from "~/lib/daily-timing";

type GuessResponse = {
  date: string;
  rows: GuessRow[];
  status: GameStatus;
  answer: string | null;
  courseName: string | null;
};

export function useDailyPuzzle() {
  const { codes } = useCourseCodes();

  const date = ref<string | null>(null);
  const rows = ref<GuessRow[]>([]);
  const current = ref("");
  const status = ref<GameStatus>("playing");
  const answer = ref<string | null>(null);
  const courseName = ref<string | null>(null);
  const stats = ref<DailyStats>({ ...EMPTY_STATS });

  const loading = ref(true);
  const submitting = ref(false);
  const message = ref("");
  const shaking = ref(false);
  const revealingRow = ref<number | null>(null);
  const failed = ref(false);

  const finished = computed(() => status.value !== "playing");
  const guesses = computed(() => rows.value.map((row) => row.guess));

  /** Best result seen per character, for tinting the keyboard. */
  const keyStates = computed(() => {
    const rank: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };
    const best = new Map<string, TileState>();

    for (const [index, row] of rows.value.entries()) {
      // Skip the row still flipping — tinting its keys would colour the answer
      // in before the tiles have turned.
      if (index === revealingRow.value) continue;
      row.guess.split("").forEach((char, i) => {
        const state = row.result[i]!;
        const seen = best.get(char);
        if (!seen || rank[state] > rank[seen]) best.set(char, state);
      });
    }

    return best;
  });

  function flash(text: string) {
    message.value = text;
    shaking.value = true;
    setTimeout(() => (shaking.value = false), 500);
    setTimeout(() => {
      if (message.value === text) message.value = "";
    }, 2000);
  }

  function recordResult(day: string, outcome: GameStatus, tries: number) {
    const saved = readStats();
    // Guard against double-counting when a finished board is replayed from
    // storage on every open.
    if (saved.lastPlayed === day) {
      stats.value = saved;
      return;
    }

    const won = outcome === "won";
    const consecutive = saved.lastPlayed === previousDay(day);
    const currentStreak = won ? (consecutive ? saved.currentStreak : 0) + 1 : 0;

    const distribution = [...saved.distribution];
    if (won) distribution[tries - 1] = (distribution[tries - 1] ?? 0) + 1;

    const next: DailyStats = {
      played: saved.played + 1,
      wins: saved.wins + (won ? 1 : 0),
      currentStreak,
      maxStreak: Math.max(saved.maxStreak, currentStreak),
      lastPlayed: day,
      distribution,
    };

    stats.value = next;
    writeStats(next);
  }

  function applyResponse(res: GuessResponse) {
    const wasFinished = finished.value;

    rows.value = res.rows;
    status.value = res.status;
    answer.value = res.answer;
    courseName.value = res.courseName;
    current.value = "";

    writeBoard({
      date: res.date,
      guesses: res.rows.map((row) => row.guess),
      rows: res.rows,
      status: res.status,
    });

    if (res.status !== "playing" && !wasFinished) {
      recordResult(res.date, res.status, res.rows.length);
    }
  }

  async function load() {
    loading.value = true;
    failed.value = false;

    try {
      const meta = await $fetch<{ date: string }>("/api/daily");
      date.value = meta.date;

      stats.value = readStats();

      const saved = readBoard();
      const sameDay = saved?.date === meta.date;

      if (sameDay && saved?.guesses?.length) {
        // Re-score the saved board server-side rather than storing the colours,
        // so a stale board can never disagree with today's answer.
        applyResponse(
          await $fetch<GuessResponse>("/api/daily/guess", {
            method: "POST",
            body: { guesses: saved.guesses },
          }),
        );
      } else if (!sameDay) {
        rows.value = [];
        status.value = "playing";
        answer.value = null;
        courseName.value = null;
        writeBoard({
          date: meta.date,
          guesses: [],
          rows: [],
          status: "playing",
        });
      }
    } catch {
      failed.value = true;
    } finally {
      loading.value = false;
    }
  }

  function type(char: string) {
    if (finished.value || submitting.value) return;
    if (current.value.length >= WORD_LENGTH) return;
    current.value += char.toUpperCase();
    message.value = "";
  }

  function backspace() {
    if (finished.value || submitting.value) return;
    current.value = current.value.slice(0, -1);
    message.value = "";
  }

  async function submit() {
    if (finished.value || submitting.value) return;

    const guess = normalizeGuess(current.value);

    if (guess.length < WORD_LENGTH) {
      flash("Kurskoden är sex tecken");
      return;
    }
    if (guesses.value.includes(guess)) {
      flash("Du har redan gissat den");
      return;
    }
    // Check against the course list we already have before spending a request
    // on a code that cannot be right.
    if (codes.value.length && !codes.value.includes(guess)) {
      flash("Inte en kurskod med tentor");
      return;
    }

    submitting.value = true;
    const rowIndex = rows.value.length;

    try {
      const res = await $fetch<GuessResponse>("/api/daily/guess", {
        method: "POST",
        body: { guesses: [...guesses.value, guess] },
      });

      applyResponse(res);
      revealingRow.value = rowIndex;
      setTimeout(() => {
        if (revealingRow.value === rowIndex) revealingRow.value = null;
      }, ROW_REVEAL_MS);
    } catch (err: any) {
      flash(err?.data?.message ?? "Något gick fel");
    } finally {
      submitting.value = false;
    }
  }

  function shareText() {
    return buildShareText(
      rows.value,
      date.value ?? stockholmDate(),
      status.value,
    );
  }

  return {
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
    load,
    type,
    backspace,
    submit,
    shareText,
  };
}
