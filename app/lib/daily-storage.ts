import { MAX_GUESSES, type GameStatus, type GuessRow } from "#shared/utils/dailyCourse";

const BOARD_KEY = "liutentor_daily_v1";
const STATS_KEY = "liutentor_daily_stats_v1";

export type StoredBoard = {
  date: string;
  guesses: string[];
  /**
   * The scored rows, kept only so the homepage card can draw your board
   * without a round trip. Never trusted as game state — the game always
   * re-scores its guesses server-side.
   */
  rows: GuessRow[];
  status: GameStatus;
};

export type DailyStats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayed: string | null;
  distribution: number[];
};

export const EMPTY_STATS: DailyStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: null,
  distribution: Array(MAX_GUESSES).fill(0),
};

function read<T>(key: string, fallback: T): T {
  if (import.meta.server) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (import.meta.server) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing and blocked site data both throw here. Losing the
    // saved board is not worth breaking the game over.
  }
}

export function readBoard(): StoredBoard | null {
  const board = read<StoredBoard | null>(BOARD_KEY, null);
  return board && typeof board.date === "string" ? board : null;
}

export function writeBoard(board: StoredBoard) {
  write(BOARD_KEY, board);
}

export function readStats(): DailyStats {
  return read<DailyStats>(STATS_KEY, EMPTY_STATS);
}

export function writeStats(stats: DailyStats) {
  write(STATS_KEY, stats);
}
