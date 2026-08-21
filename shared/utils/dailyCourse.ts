/**
 * Pure logic for "Dagens kurskod" — the daily course-code puzzle.
 *
 * Everything here is dependency-free so it can run identically on the server
 * (which holds the answer and scores guesses) and in the browser (which renders
 * the board and builds the share text), and be unit tested under plain Bun.
 *
 * Note that choosing the answer is deliberately not here: it belongs to the Go
 * service, which writes the day's code to `daily_puzzle` the first time it is
 * asked for. Deriving it from the date instead made it depend on a candidate
 * pool built from live exam counts, so it could shift mid-day.
 */

/** Every LiU course code is exactly six characters. */
export const WORD_LENGTH = 6;

export const MAX_GUESSES = 6;

export type TileState = "correct" | "present" | "absent";

export type GuessRow = {
  guess: string;
  result: TileState[];
};

export type GameStatus = "playing" | "won" | "lost";

/**
 * The calendar date in Stockholm, as `YYYY-MM-DD`.
 *
 * The puzzle rolls over at Swedish midnight for everyone, so a player abroad
 * still gets the same word as their friends at home. `sv-SE` is used because it
 * formats as ISO `YYYY-MM-DD` natively.
 */
export function stockholmDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The puzzle's date, written the way a Swede would say it: "21 augusti". */
export function formatPuzzleDate(dateStr: string): string {
  // Midday UTC keeps the calendar date intact regardless of the formatter.
  const date = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

/**
 * The calendar day before `dateStr`, for checking whether a streak continues.
 *
 * Done in UTC from midday so month ends, leap days and daylight saving can't
 * push the result onto the wrong date.
 */
export function previousDay(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Milliseconds until the next Stockholm midnight, for the countdown. */
export function msUntilNextPuzzle(now: Date = new Date()): number {
  const today = stockholmDate(now);
  let ms = 60_000;

  // Walk forward in coarse steps rather than doing timezone arithmetic by
  // hand, which is what makes DST transitions so easy to get wrong.
  while (stockholmDate(new Date(now.getTime() + ms)) === today) {
    ms += 60_000;
  }

  // Narrow the last minute down to the second.
  let precise = ms - 60_000;
  while (stockholmDate(new Date(now.getTime() + precise)) === today) {
    precise += 1000;
  }

  return precise;
}

export function normalizeGuess(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Score a guess against the answer using standard Wordle rules.
 *
 * Two passes matter: exact matches are claimed first, and only the characters
 * left over can turn a later duplicate yellow. Scoring in one pass marks the
 * second `A` of `TATA43` present against `TATA24`, which is wrong.
 */
export function scoreGuess(guess: string, answer: string): TileState[] {
  const g = normalizeGuess(guess);
  const a = normalizeGuess(answer);

  const result: TileState[] = new Array(g.length).fill("absent");
  const remaining = new Map<string, number>();

  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
    } else {
      const char = a[i]!;
      remaining.set(char, (remaining.get(char) ?? 0) + 1);
    }
  }

  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;

    const char = g[i]!;
    const left = remaining.get(char) ?? 0;
    if (left > 0) {
      result[i] = "present";
      remaining.set(char, left - 1);
    }
  }

  return result;
}

export function statusFor(rows: GuessRow[], maxGuesses = MAX_GUESSES): GameStatus {
  const won = rows.some((row) => row.result.every((tile) => tile === "correct"));
  if (won) return "won";
  return rows.length >= maxGuesses ? "lost" : "playing";
}

const SHARE_TILE: Record<TileState, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

/**
 * The result grid, which reveals how you did without revealing the code.
 */
export function buildShareText(
  rows: GuessRow[],
  date: string,
  status: GameStatus,
  url = "https://liutentor.se/dagens-kurskod",
): string {
  const score = status === "won" ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const grid = rows
    .map((row) => row.result.map((tile) => SHARE_TILE[tile]).join(""))
    .join("\n");

  return `LiU Tentor · Dagens kurskod\n${formatPuzzleDate(date)}  ${score}\n\n${grid}\n\n${url}`;
}
