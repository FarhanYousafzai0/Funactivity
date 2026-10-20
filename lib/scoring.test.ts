import { describe, expect, it } from "vitest";
import { MAX_TOTAL, parseScore, rankEntries, totalScore } from "./scoring";

describe("totalScore", () => {
  it("adds the four criteria", () => {
    expect(totalScore({ problem: 5, solution: 4, ai_use: 3, clarity: 2 })).toBe(14);
  });

  it("maxes out at MAX_TOTAL", () => {
    expect(totalScore({ problem: 5, solution: 5, ai_use: 5, clarity: 5 })).toBe(MAX_TOTAL);
  });
});

describe("parseScore", () => {
  const form = (values: Record<string, unknown>) => (key: string) => values[key];

  it("reads strings from form data", () => {
    expect(parseScore(form({ problem: "5", solution: "4", ai_use: "3", clarity: "1" }))).toEqual({ problem: 5, solution: 4, ai_use: 3, clarity: 1 });
  });

  it("rejects a missing criterion", () => {
    expect(parseScore(form({ problem: "5", solution: "4", ai_use: "3" }))).toBeNull();
  });

  it("rejects values outside 1–5 and non-integers", () => {
    expect(parseScore(form({ problem: "0", solution: "4", ai_use: "3", clarity: "1" }))).toBeNull();
    expect(parseScore(form({ problem: "6", solution: "4", ai_use: "3", clarity: "1" }))).toBeNull();
    expect(parseScore(form({ problem: "2.5", solution: "4", ai_use: "3", clarity: "1" }))).toBeNull();
  });
});

describe("rankEntries", () => {
  it("puts the highest total first and leaves unscored entries unranked at the end", () => {
    const ranked = rankEntries([
      { name: "low", total: 10, scoredAt: "2026-10-20T11:00:00Z" },
      { name: "none", total: null, scoredAt: null },
      { name: "high", total: 18, scoredAt: "2026-10-20T11:05:00Z" },
    ]);
    expect(ranked.map((entry) => [entry.name, entry.rank])).toEqual([
      ["high", 1],
      ["low", 2],
      ["none", null],
    ]);
  });

  it("gives tied totals the same rank and skips the next one", () => {
    const ranked = rankEntries([
      { name: "a", total: 15, scoredAt: "2026-10-20T11:02:00Z" },
      { name: "b", total: 15, scoredAt: "2026-10-20T11:01:00Z" },
      { name: "c", total: 12, scoredAt: "2026-10-20T11:00:00Z" },
    ]);
    // Same total: whoever was scored first is listed first, but both are #1.
    expect(ranked.map((entry) => [entry.name, entry.rank])).toEqual([
      ["b", 1],
      ["a", 1],
      ["c", 3],
    ]);
  });
});
