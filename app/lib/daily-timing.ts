import { WORD_LENGTH } from "#shared/utils/dailyCourse";

/** Gap between one tile starting its flip and the next. */
export const STAGGER_MS = 180;

/** How long a single tile takes to turn all the way over. */
export const FLIP_MS = 360;

/**
 * How long a whole row takes to reveal.
 *
 * The board, the keyboard and the result panel all have to agree on this: the
 * server hands back the entire scored row at once, so anything that paints
 * before the tiles have turned gives the answer away early.
 */
export const ROW_REVEAL_MS = (WORD_LENGTH - 1) * STAGGER_MS + FLIP_MS;
