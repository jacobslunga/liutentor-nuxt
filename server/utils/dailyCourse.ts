import { WORD_LENGTH } from "#shared/utils/dailyCourse";

import { GO_API_URL } from "./api";
import { getCourseIndex } from "./courses";

export type DailyPuzzle = {
  date: string;
  answer: string;
  courseName: string;
  isValidGuess: (code: string) => boolean;
};

type GoPuzzle = {
  date: string;
  courseCode: string;
  courseName: string;
};

/**
 * How long a resolved puzzle is trusted inside one server instance.
 *
 * The answer itself is immutable once the Go service has written it, so this is
 * purely to stop a burst of guesses from making its own upstream call each. It
 * is short enough that the rollover at Stockholm midnight is never noticeably
 * late.
 */
const CACHE_TTL_MS = 60 * 1000;

let cached: { puzzle: GoPuzzle; at: number } | null = null;

async function fetchPuzzle(): Promise<GoPuzzle> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.puzzle;

  const res = await $fetch<{ data?: GoPuzzle }>(`${GO_API_URL}/v1/daily/LIU`);
  const puzzle = res?.data;

  if (!puzzle?.courseCode) {
    throw createError({
      statusCode: 503,
      message: "Dagens kurskod är inte tillgänglig just nu",
    });
  }

  cached = { puzzle, at: Date.now() };
  return puzzle;
}

export async function getDailyPuzzle(): Promise<DailyPuzzle> {
  const [puzzle, courses] = await Promise.all([fetchPuzzle(), getCourseIndex()]);

  // Any real course code is a legal guess, whether or not it could be today's
  // answer — the answer pool is much narrower than the set of things a player
  // might reasonably try.
  const valid = new Set(
    courses
      .filter((course) => course.code.length === WORD_LENGTH)
      .map((course) => course.code),
  );

  return {
    date: puzzle.date,
    answer: puzzle.courseCode,
    courseName: puzzle.courseName ?? "",
    isValidGuess: (code) => valid.has(code),
  };
}
