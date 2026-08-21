import {
  MAX_GUESSES,
  WORD_LENGTH,
  normalizeGuess,
  scoreGuess,
  statusFor,
  type GuessRow,
} from "#shared/utils/dailyCourse";

import { getDailyPuzzle } from "../../utils/dailyCourse";

type Body = {
  guesses?: unknown;
};

/**
 * Scores a whole board at once.
 *
 * The client re-posts its full guess history each turn rather than the server
 * holding a session. That keeps the answer server-side until the game is over —
 * you cannot read tomorrow's code out of devtools — while staying completely
 * stateless, so a reload just re-derives the same colours.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event);

  if (!Array.isArray(body?.guesses)) {
    throw createError({ statusCode: 400, message: "guesses must be an array" });
  }

  if (body.guesses.length > MAX_GUESSES) {
    throw createError({ statusCode: 400, message: "Too many guesses" });
  }

  const guesses = body.guesses.map((value) => normalizeGuess(String(value ?? "")));

  const puzzle = await getDailyPuzzle();

  for (const guess of guesses) {
    if (guess.length !== WORD_LENGTH || !puzzle.isValidGuess(guess)) {
      throw createError({
        statusCode: 400,
        message: "Inte en kurskod",
        data: { invalid: guess },
      });
    }
  }

  const rows: GuessRow[] = [];
  for (const guess of guesses) {
    rows.push({ guess, result: scoreGuess(guess, puzzle.answer) });
    // Stop scoring past a win so a client cannot pad the board to force the
    // reveal after it has already solved it.
    if (guess === puzzle.answer) break;
  }

  const status = statusFor(rows, MAX_GUESSES);
  const finished = status !== "playing";

  return {
    date: puzzle.date,
    rows,
    status,
    answer: finished ? puzzle.answer : null,
    courseName: finished ? puzzle.courseName : null,
  };
});
