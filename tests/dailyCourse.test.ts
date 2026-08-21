import { describe, expect, it } from "bun:test";

import {
  MAX_GUESSES,
  buildShareText,
  formatPuzzleDate,
  msUntilNextPuzzle,
  previousDay,
  scoreGuess,
  statusFor,
  stockholmDate,
} from "../shared/utils/dailyCourse";

describe("scoreGuess", () => {
  it("marks an exact match all correct", () => {
    expect(scoreGuess("TATA24", "TATA24")).toEqual([
      "correct", "correct", "correct", "correct", "correct", "correct",
    ]);
  });

  it("does not award a duplicate character that is already used up", () => {
    // TATA43 vs TATA24: T,A,T,A all land exactly. The answer has no 4 in
    // position 5 but does have one in position 6, so the guessed 4 is present.
    // The guessed 3 is absent entirely.
    expect(scoreGuess("TATA43", "TATA24")).toEqual([
      "correct", "correct", "correct", "correct", "present", "absent",
    ]);
  });

  it("only marks as many duplicates present as the answer actually holds", () => {
    // The answer holds a single A, at position 2, and the guess matches it
    // exactly. Its leading A has nothing left to claim, so it must be absent.
    expect(scoreGuess("AAB123", "CAB123")).toEqual([
      "absent", "correct", "correct", "correct", "correct", "correct",
    ]);
  });

  it("lets an exact match claim a character before an earlier tile does", () => {
    // Answer AAAAAT, guess TAAAAA. The four middle A's match exactly, leaving
    // one A and one T unclaimed — so the guess's leading T and trailing A are
    // both present. Scoring left to right in one pass gets this wrong.
    expect(scoreGuess("TAAAAA", "AAAAAT")).toEqual([
      "present", "correct", "correct", "correct", "correct", "present",
    ]);
  });

  it("is case and whitespace insensitive", () => {
    expect(scoreGuess(" tata24 ", "TATA24")).toEqual(
      scoreGuess("TATA24", "TATA24"),
    );
  });
});

describe("formatPuzzleDate", () => {
  it("writes the date the Swedish way", () => {
    expect(formatPuzzleDate("2026-08-21")).toBe("21 augusti");
    expect(formatPuzzleDate("2026-01-01")).toBe("1 januari");
  });

  it("keeps the calendar date it was given", () => {
    // Parsing without a fixed hour can slide the date across a timezone.
    expect(formatPuzzleDate("2026-03-01")).toBe("1 mars");
    expect(formatPuzzleDate("2026-12-31")).toBe("31 december");
  });
});

describe("previousDay", () => {
  it("steps back one day", () => {
    expect(previousDay("2026-08-21")).toBe("2026-08-20");
  });

  it("steps back across a month boundary", () => {
    expect(previousDay("2026-09-01")).toBe("2026-08-31");
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
  });

  it("steps back across a year boundary", () => {
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });

  it("handles a leap day", () => {
    expect(previousDay("2028-03-01")).toBe("2028-02-29");
  });

  it("is unaffected by daylight saving transitions", () => {
    // A streak must not break just because the clocks moved.
    expect(previousDay("2026-03-29")).toBe("2026-03-28");
    expect(previousDay("2026-10-25")).toBe("2026-10-24");
  });
});

describe("stockholmDate", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(stockholmDate(new Date("2026-08-21T10:00:00Z"))).toBe("2026-08-21");
  });

  it("uses the Stockholm day, not UTC", () => {
    // 22:30 UTC in August is 00:30 the next day in Stockholm (UTC+2).
    expect(stockholmDate(new Date("2026-08-21T22:30:00Z"))).toBe("2026-08-22");
  });
});

describe("msUntilNextPuzzle", () => {
  it("counts down to the next Stockholm midnight", () => {
    const ms = msUntilNextPuzzle(new Date("2026-08-21T21:00:00Z")); // 23:00 CEST
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(60 * 60 * 1000);
  });

  it("lands on the following calendar day", () => {
    const now = new Date("2026-08-21T10:00:00Z");
    const next = new Date(now.getTime() + msUntilNextPuzzle(now));
    expect(stockholmDate(next)).toBe("2026-08-22");
  });

  it("crosses the spring DST transition to the next day", () => {
    // Sweden springs forward on 2026-03-29 — that day is 23 hours long, and
    // naive hour arithmetic lands on the wrong date here.
    const now = new Date("2026-03-28T10:00:00Z");
    const next = new Date(now.getTime() + msUntilNextPuzzle(now));
    expect(stockholmDate(next)).toBe("2026-03-29");
  });

  it("crosses the autumn DST transition to the next day", () => {
    // 2026-10-25 is 25 hours long.
    const now = new Date("2026-10-24T10:00:00Z");
    const next = new Date(now.getTime() + msUntilNextPuzzle(now));
    expect(stockholmDate(next)).toBe("2026-10-25");
  });
});

describe("statusFor", () => {
  const win = { guess: "TATA24", result: Array(6).fill("correct" as const) };
  const miss = { guess: "TDDD86", result: Array(6).fill("absent" as const) };

  it("stays playing below the guess limit", () => {
    expect(statusFor([miss])).toBe("playing");
  });

  it("wins on an all-correct row", () => {
    expect(statusFor([miss, win])).toBe("won");
  });

  it("loses once the guesses run out", () => {
    expect(statusFor(Array(MAX_GUESSES).fill(miss))).toBe("lost");
  });

  it("wins on the final guess rather than losing", () => {
    expect(statusFor([...Array(MAX_GUESSES - 1).fill(miss), win])).toBe("won");
  });
});

describe("buildShareText", () => {
  const rows = [
    { guess: "TDDD86", result: ["absent", "present", "absent", "absent", "absent", "correct"] as const },
    { guess: "TATA24", result: Array(6).fill("correct" as const) },
  ];

  it("reports the score and grid without leaking the answer", () => {
    const text = buildShareText([...rows], "2026-08-21", "won");
    expect(text).toContain("21 augusti  2/6");
    expect(text).toContain("⬛🟨⬛⬛⬛🟩");
    expect(text).toContain("🟩🟩🟩🟩🟩🟩");
    expect(text).toContain("https://liutentor.se/dagens-kurskod");
    expect(text).not.toContain("TATA24");
  });

  it("marks a loss with X", () => {
    expect(buildShareText([...rows], "2026-08-21", "lost")).toContain(
      "21 augusti  X/6",
    );
  });

  it("never prints the internal puzzle number", () => {
    expect(buildShareText([...rows], "2026-08-21", "won")).not.toMatch(/#\d/);
  });
});
