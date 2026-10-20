// The profile photo is made outside this app: the student copies the prompt for their gender into
// ChatGPT or Gemini together with a photo of themselves, downloads the result and uploads it here.
// Both prompts produce the same AI Skool studio style: dark #071512 background, soft emerald glow.

export const PHOTO_STYLES = [
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
] as const;

export type PhotoStyleKey = (typeof PHOTO_STYLES)[number]["key"];

export function isPhotoStyle(value: unknown): value is PhotoStyleKey {
  return PHOTO_STYLES.some((style) => style.key === value);
}

const FEMALE_PROMPT = `Transform my uploaded photo into a premium, photorealistic studio headshot for an AI Skool student profile.

Use my uploaded image as the primary identity reference. Preserve my real identity through the visible features, especially the eyes, eyebrows, forehead shape, skin tone, age, and ethnicity. Do not replace the person with a different face.

Convert the subject into modest Islamic attire suitable for privacy. Dress the subject in a clean, elegant black hijab with modest black clothing. Cover the lower face using a normal black face mask commonly worn for face covering, so the hair, neck, and lower face are covered, while the eyes remain visible. The mask should look natural, realistic, and wearable, not like an artificial or fantasy mask. Keep the overall look modest, clean, and professional.

Replace the original background with a dark green-black studio backdrop using #071512 as the base color. Add a soft, diffused emerald-green glow behind the subject and subtle green rim lighting around the outer edges of the hijab and shoulders. Keep the background clean, smooth, and professional with no objects, text, patterns, or distractions.

Use soft professional frontal studio lighting with realistic shadows and polished portrait quality. The green lighting should remain subtle and stylish, not overpowering the visible facial area.

Position the subject facing directly toward the camera, with a calm, confident, approachable expression visible through the eyes, relaxed shoulders, and natural posture. Use a centered, symmetrical head-and-shoulders composition similar to a professional profile portrait.

Do not add logos, text, or unnecessary accessories.

Output requirements:
- square 1:1 composition
- 1024x1024 resolution
- realistic studio photography
- dark background #071512
- soft emerald-green glow
- subtle green edge lighting
- centered consistent framing
- no text, logos, watermarks, or extra accessories

Final result must preserve the student’s recognizable identity while presenting her in a privacy-safe, modest, professional AI Skool student profile style.`;

const MALE_PROMPT = `Transform my uploaded photo into a premium, photorealistic studio headshot for an AI Skool student profile.

Use my uploaded image as the primary identity reference. Preserve my real facial identity, facial proportions, skin tone, age, ethnicity, hairstyle, hair texture, beard or facial hair, and natural features. Do not reshape, beautify, or replace my face.

Replace the original background with a dark green-black studio backdrop using #071512 as the base color. Add a soft, diffused emerald-green glow behind the subject and subtle green rim lighting around the outer edges of the hair and shoulders. Keep the background clean, smooth, and professional with no objects, text, patterns, or distractions.

Use soft professional frontal studio lighting with realistic shadows, natural skin tones, and sharp facial detail. The green lighting should remain subtle and stylish, not overpowering the face.

Position the subject facing directly toward the camera, with a calm, confident, approachable expression, relaxed shoulders, and natural posture. Use a centered, symmetrical head-and-shoulders composition similar to a professional profile portrait.

Keep the clothing simple, modest, and professional. Preserve the student’s original clothing style when possible, or convert it into clean plain professional clothing if needed. Do not copy any shirt design, logos, or branding from reference images.

Output requirements:
- square 1:1 composition
- 1024x1024 resolution
- realistic studio photography
- dark background #071512
- soft emerald-green glow
- subtle green edge lighting
- centered consistent framing
- no text, logos, watermarks, or extra accessories

Final result must preserve the student’s recognizable identity while matching a consistent AI Skool student profile style.`;

export const PHOTO_PROMPTS: Record<PhotoStyleKey, string> = {
  female: FEMALE_PROMPT,
  male: MALE_PROMPT,
};

export function buildPhotoPrompt(styleKey: PhotoStyleKey) {
  return PHOTO_PROMPTS[styleKey];
}

export const AI_TOOLS = [
  { name: "ChatGPT", href: "https://chatgpt.com/" },
  { name: "Gemini", href: "https://gemini.google.com/app" },
] as const;
