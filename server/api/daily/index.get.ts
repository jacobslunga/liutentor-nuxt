import {
  MAX_GUESSES,
  WORD_LENGTH,
  msUntilNextPuzzle,
} from "#shared/utils/dailyCourse";

import { getDailyPuzzle } from "../../utils/dailyCourse";

/**
 * Today's puzzle metadata. Deliberately never includes the answer — the client
 * only ever learns it from a finished game.
 */
export default defineEventHandler(async (event) => {
  const puzzle = await getDailyPuzzle();

  // The shared 24h CDN cache would happily serve today's date well into
  // tomorrow, so this response expires at the next Stockholm midnight instead.
  const maxAge = Math.max(60, Math.floor(msUntilNextPuzzle() / 1000));
  setHeader(event, "Cache-Control", "public, max-age=0, must-revalidate");
  setHeader(
    event,
    "Netlify-CDN-Cache-Control",
    `public, durable, s-maxage=${maxAge}, stale-while-revalidate=60`,
  );

  return {
    date: puzzle.date,
    length: WORD_LENGTH,
    maxGuesses: MAX_GUESSES,
  };
});
