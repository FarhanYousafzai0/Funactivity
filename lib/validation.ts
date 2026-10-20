// Field limits shared by the client forms (for counters) and the server actions (the real check).
export const LIMITS = {
  name: 40,
  tagline: 60,
  title: 100,
  problem: 1500,
  audience: 400,
  solution: 2000,
  note: 300,
} as const;

export const PHOTO_MAX_BYTES = 300_000;
export const PHOTO_PREFIX = "data:image/jpeg;base64,";

/** Collapses whitespace and trims. Form values arrive as unknown, so anything that is not a string becomes "". */
export function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function textError(value: string, label: string, max: number, required = true) {
  if (!value) return required ? `${label} is required.` : null;
  if (value.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

/** The browser sends a 512×512 JPEG data URL. Anything else is refused. */
export function photoError(value: unknown) {
  if (typeof value !== "string" || !value) return "Add your profile photo first.";
  if (!value.startsWith(PHOTO_PREFIX)) return "The photo must be a JPEG image.";
  const base64 = value.slice(PHOTO_PREFIX.length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return "The photo data is not valid.";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = Math.floor((base64.length * 3) / 4) - padding;
  if (bytes > PHOTO_MAX_BYTES) return "The photo is too large. Try again, it will be resized.";
  return null;
}

export function isValidId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{10}$/.test(value);
}
