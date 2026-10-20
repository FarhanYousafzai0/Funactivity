// The profile photo is made outside this app: the student copies a prompt into ChatGPT or Gemini,
// attaches a selfie, downloads the result and uploads it here.
export const PHOTO_STYLES = [
  {
    key: "3d",
    label: "3D cartoon",
    emoji: "🧑‍🚀",
    look: "a friendly 3D animated-movie character with soft, rounded features and smooth studio lighting",
  },
  {
    key: "flat",
    label: "Flat illustration",
    emoji: "🎨",
    look: "a clean flat vector illustration with bold shapes, minimal shading and a modern startup feel",
  },
  {
    key: "comic",
    label: "Comic hero",
    emoji: "⚡",
    look: "a bold comic-book hero portrait with confident ink lines and halftone shading",
  },
] as const;

export type PhotoStyleKey = (typeof PHOTO_STYLES)[number]["key"];

export function isPhotoStyle(value: unknown): value is PhotoStyleKey {
  return PHOTO_STYLES.some((style) => style.key === value);
}

export function buildPhotoPrompt(styleKey: PhotoStyleKey, name: string) {
  const style = PHOTO_STYLES.find((item) => item.key === styleKey) ?? PHOTO_STYLES[0];
  const who = name.trim() ? ` My name is ${name.trim()}.` : "";
  return [
    `Create a square (1:1) profile picture of me for a startup pitch event called Pitch Arena at AI Skool.${who}`,
    "Use the selfie I attached as the reference for my face and keep me recognisable.",
    `Style: ${style.look}.`,
    "Shoulders-up portrait, looking at the camera, confident friendly smile, bright mint-green gradient background (#00EF8B fading to white).",
    "No text, no logos, no watermark, no hands.",
  ].join(" ");
}

export const AI_TOOLS = [
  { name: "ChatGPT", href: "https://chatgpt.com/" },
  { name: "Gemini", href: "https://gemini.google.com/app" },
] as const;
