"use client";

import { Check, ExternalLink, Sparkles, Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { createProfileAction, type ProfileFormState } from "@/app/actions/profile";
import { CopyButton } from "@/components/CopyButton";
import { AI_TOOLS, buildPhotoPrompt, PHOTO_STYLES, type PhotoStyleKey } from "@/lib/photo-prompt";
import { INTEREST_OPTIONS, MAX_INTERESTS, STUDY_OPTIONS } from "@/lib/profile-options";
import { LIMITS, PHOTO_MAX_BYTES } from "@/lib/validation";

const PHOTO_SIZE = 512;

/**
 * Shrinks any picture to a 512×512 JPEG in the browser (centre crop), so a 4 MB download from
 * ChatGPT becomes ~80 KB before it is ever sent to the server. Tries lower quality until it fits.
 */
async function resizeToDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const context = canvas.getContext("2d")!;
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  bitmap.close();
  for (const quality of [0.86, 0.72, 0.58, 0.45]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length * 0.75 <= PHOTO_MAX_BYTES) return dataUrl;
  }
  throw new Error("too-large");
}

const fieldClass =
  "mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-brand-deep focus:ring-4 focus:ring-brand/25";
const stepClass = "rounded-3xl border border-line bg-white/85 p-5 shadow-[0_24px_60px_rgba(7,17,13,0.06)] backdrop-blur sm:p-6";

/** Checkbox chips. Real <input type="checkbox"> elements so the values travel with the form. */
function ChipGroup({
  name,
  options,
  selected,
  onToggle,
  full = false,
}: {
  name: string;
  options: readonly { key: string; label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
  full?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => {
        const checked = selected.includes(option.key);
        const disabled = full && !checked;
        return (
          <label
            key={option.key}
            className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 ${
              checked ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-brand-deep"
            } ${disabled ? "cursor-not-allowed opacity-40 hover:translate-y-0 hover:border-line" : ""}`}
          >
            <input type="checkbox" name={name} value={option.key} checked={checked} disabled={disabled} onChange={() => onToggle(option.key)} className="sr-only" />
            <span className={`grid size-4 place-items-center rounded-full border ${checked ? "border-brand bg-brand text-ink" : "border-line"}`}>
              {checked ? <Check className="size-3" aria-hidden /> : null}
            </span>
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

export function ProfileForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(createProfileAction, { error: null });
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [style, setStyle] = useState<PhotoStyleKey | null>(null);
  const [studies, setStudies] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const prompt = style ? buildPhotoPrompt(style) : "";
  const ready = name.trim().length > 0 && studies.length > 0 && interests.length > 0 && Boolean(style) && Boolean(photo) && !busy;

  function toggle(list: string[], key: string, max = Infinity) {
    if (list.includes(key)) return list.filter((item) => item !== key);
    return list.length >= max ? list : [...list, key];
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setBusy(true);
    try {
      if (!file.type.startsWith("image/")) throw new Error("not-image");
      setPhoto(await resizeToDataUrl(file));
    } catch (error) {
      setPhoto(null);
      setPhotoError(
        error instanceof Error && error.message === "not-image"
          ? "That file is not an image. Pick the PNG or JPG you downloaded."
          : "We could not read that picture. Try saving it again as PNG or JPG.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={formAction} className="rise space-y-5">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="photoStyle" value={style ?? ""} />
      <input type="hidden" name="photo" value={photo ?? ""} />

      {/* 1 · Name */}
      <section className={stepClass}>
        <h2 className="text-lg font-black">1 · Who are you?</h2>
        <label className="mt-3 block text-sm font-semibold">
          Your name
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={LIMITS.name}
            required
            autoComplete="name"
            placeholder="e.g. Ayesha Khan"
            className={fieldClass}
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          One line about you <span className="font-normal text-muted">(optional)</span>
          <input
            name="tagline"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            maxLength={LIMITS.tagline}
            placeholder="e.g. FSc student from Nowshera, loves football"
            className={fieldClass}
          />
          <span className="mt-1 block text-right font-mono text-[10px] text-muted">
            {tagline.length}/{LIMITS.tagline}
          </span>
        </label>
      </section>

      {/* 2 · Studies + interests */}
        <section className={stepClass}>
          <h2 className="text-lg font-black">2 · About you</h2>
          <fieldset className="mt-3">
            <legend className="text-sm font-semibold">
              What are you studying right now? <span className="font-normal text-muted">(tick all that apply)</span>
            </legend>
            <ChipGroup name="studies" options={STUDY_OPTIONS} selected={studies} onToggle={(key) => setStudies(toggle(studies, key))} />
          </fieldset>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">
              What do you want to become? <span className="font-normal text-muted">(up to {MAX_INTERESTS})</span>
            </legend>
            <ChipGroup
              name="interests"
              options={INTEREST_OPTIONS}
              selected={interests}
              onToggle={(key) => setInterests(toggle(interests, key, MAX_INTERESTS))}
              full={interests.length >= MAX_INTERESTS}
            />
          </fieldset>
        </section>

        {/* 3 · Prompt */}
        <section className={stepClass}>
          <h2 className="text-lg font-black">3 · Make your photo with AI</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Choose male or female to get the right prompt. Copy it, open ChatGPT or Gemini, attach a photo of yourself, paste the prompt, and
            download the picture it makes.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Prompt for">
            {PHOTO_STYLES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={style === item.key}
                onClick={() => setStyle(item.key)}
                className={`h-12 rounded-2xl border text-sm font-bold transition ${
                  style === item.key ? "border-brand-deep bg-ink text-white" : "border-line bg-white hover:border-brand-deep"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {style ? (
            <>
              <textarea readOnly value={prompt} rows={10} className={`${fieldClass} mt-4 resize-y bg-mint/60 text-sm leading-6`} aria-label="Photo prompt" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CopyButton text={prompt} />
                {AI_TOOLS.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0"
                  >
                    <ExternalLink className="size-4" aria-hidden /> Open {tool.name}
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">Tip: attach a clear, well-lit photo of yourself before you send the prompt.</p>
            </>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted">Pick one above and your prompt appears here.</p>
          )}
        </section>

        {/* 4 · Upload */}
      <section className={stepClass}>
        <h2 className="text-lg font-black">4 · Upload the picture</h2>
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-mint">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Your profile photo" className="size-full object-cover" />
            ) : (
              <span className="px-3 text-center text-xs text-muted">{busy ? "Resizing…" : "Your photo appears here"}</span>
            )}
          </div>
          <div className="w-full">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0">
              <Upload className="size-4" aria-hidden /> {photo ? "Choose a different picture" : "Choose picture"}
              <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
            </label>
            <p className="mt-2 text-xs leading-5 text-muted">
              PNG or JPG from ChatGPT or Gemini. Your browser shrinks it to 512×512 before upload, so even a big download is fine.
            </p>
            {photoError ? <p className="mt-2 text-sm font-semibold text-red-600">{photoError}</p> : null}
          </div>
        </div>
      </section>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!ready || pending}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-black text-ink shadow-[0_18px_48px_rgba(0,239,139,0.25)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-brand disabled:hover:text-ink"
      >
        <Sparkles className="size-4" aria-hidden /> {pending ? "Saving your profile…" : "Create my profile"}
      </button>
    </form>
  );
}
