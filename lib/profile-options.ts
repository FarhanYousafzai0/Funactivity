// Checkbox options for the profile form. Keys are stored in the database; labels are shown.

export const STUDY_OPTIONS = [
  { key: "school", label: "School (Matric)" },
  { key: "college", label: "College (FSc / Intermediate)" },
  { key: "university", label: "University student" },
  { key: "graduate", label: "Graduated" },
  { key: "working", label: "Working / job" },
  { key: "other", label: "Something else" },
] as const;

export const INTEREST_OPTIONS = [
  { key: "ai-expert", label: "AI expert" },
  { key: "ai-automation", label: "AI automation (n8n)" },
  { key: "ai-agents", label: "AI agents & chatbots" },
  { key: "youtube-automation", label: "YouTube automation" },
  { key: "vibe-coding", label: "Vibe coding & web apps" },
  { key: "freelancing", label: "Freelancing" },
  { key: "ai-design", label: "Design & video with AI" },
  { key: "data-ml", label: "Data science & ML" },
  { key: "startup", label: "Start my own business" },
  { key: "exploring", label: "Still exploring" },
] as const;

export type StudyKey = (typeof STUDY_OPTIONS)[number]["key"];
export type InterestKey = (typeof INTEREST_OPTIONS)[number]["key"];

export const MAX_INTERESTS = 5;

type Option = { readonly key: string; readonly label: string };

/** Keeps only known keys, in option order, without duplicates. Accepts form values or a stored JSON string. */
export function pickKeys<T extends Option>(options: readonly T[], raw: unknown): T["key"][] {
  let values: unknown[] = [];
  if (Array.isArray(raw)) values = raw;
  else if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      values = Array.isArray(parsed) ? parsed : [raw];
    } catch {
      values = [raw];
    }
  }
  const wanted = new Set(values.filter((value): value is string => typeof value === "string"));
  return options.filter((option) => wanted.has(option.key)).map((option) => option.key);
}

export function labelsFor<T extends Option>(options: readonly T[], keys: readonly string[]) {
  return keys.map((key) => options.find((option) => option.key === key)?.label).filter((label): label is string => Boolean(label));
}
