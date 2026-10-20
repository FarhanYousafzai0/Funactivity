// The judges' rubric. Four criteria, each 1–5, so a perfect pitch scores 20.
export const RUBRIC = [
  { key: "problem", label: "Real problem", hint: "Is this a problem people actually face?" },
  { key: "solution", label: "Clear solution", hint: "Does the idea clearly solve it?" },
  { key: "ai_use", label: "Smart use of AI", hint: "Does AI make it better, faster or cheaper?" },
  { key: "clarity", label: "Pitch clarity", hint: "Could you explain it to a friend in two minutes?" },
] as const;

export type RubricKey = (typeof RUBRIC)[number]["key"];
export type ScoreInput = Record<RubricKey, number>;

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;
export const MAX_TOTAL = RUBRIC.length * SCORE_MAX;

export function totalScore(score: ScoreInput) {
  return RUBRIC.reduce((sum, item) => sum + score[item.key], 0);
}

/** Reads the four criteria out of form data. Returns null unless every one is a whole number 1–5. */
export function parseScore(get: (key: string) => unknown): ScoreInput | null {
  const result = {} as ScoreInput;
  for (const item of RUBRIC) {
    const raw = get(item.key);
    const value = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN;
    if (!Number.isInteger(value) || value < SCORE_MIN || value > SCORE_MAX) return null;
    result[item.key] = value;
  }
  return result;
}

export type Rankable = { total: number | null; scoredAt: string | null };

/**
 * Scored entries first, highest total first; a tie goes to whoever was scored earlier.
 * Ties share a rank (two 18s are both #1 and the next is #3). Unscored entries get no rank.
 */
export function rankEntries<T extends Rankable>(entries: readonly T[]): (T & { rank: number | null })[] {
  const scored = entries
    .filter((entry) => entry.total !== null)
    .sort((a, b) => b.total! - a.total! || (a.scoredAt ?? "").localeCompare(b.scoredAt ?? ""));
  const unscored = entries.filter((entry) => entry.total === null);
  let rank = 0;
  const ranked = scored.map((entry, index) => {
    if (index === 0 || entry.total !== scored[index - 1].total) rank = index + 1;
    return { ...entry, rank };
  });
  return [...ranked, ...unscored.map((entry) => ({ ...entry, rank: null }))];
}
