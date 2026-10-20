"use client";

import { Camera, Check, Upload, X } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { updatePhotoAction, type ProfileFormState } from "@/app/actions/profile";
import { CopyButton } from "@/components/CopyButton";
import { AI_TOOLS, buildPhotoPrompt, isPhotoStyle, PHOTO_STYLES, type PhotoStyleKey } from "@/lib/photo-prompt";
import { photoErrorMessage, resizePhotoToDataUrl } from "@/lib/resize-photo";

/** Lets the owner of a profile replace their photo. Runs in the browser because it resizes the picture there. */
export function PhotoUpdater({ profileId, photoStyle }: { profileId: string; photoStyle: string | null }) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(updatePhotoAction, { error: null });
  // The panel is open from the moment it was opened until a save lands after that moment.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [style, setStyle] = useState<PhotoStyleKey>(isPhotoStyle(photoStyle) ? photoStyle : "male");
  const [photo, setPhoto] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const open = openedAt !== null && !(state.savedAt && state.savedAt > openedAt);
  const justSaved = Boolean(state.savedAt) && !open;

  function openPanel() {
    setPhoto(null);
    setFileError(null);
    setOpenedAt(new Date().toISOString());
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setBusy(true);
    try {
      setPhoto(await resizePhotoToDataUrl(file));
    } catch (error) {
      setPhoto(null);
      setFileError(photoErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={openPanel}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0 active:scale-[0.97]"
        >
          <Camera className="size-4" aria-hidden /> Change photo
        </button>
        {justSaved ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-deep">
            <Check className="size-3.5" aria-hidden /> Photo updated
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="rise mt-4 rounded-2xl border border-line bg-mint/50 p-4 text-left">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="photoStyle" value={style} />
      <input type="hidden" name="photo" value={photo ?? ""} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">New profile photo</p>
        <button type="button" onClick={() => setOpenedAt(null)} aria-label="Cancel" className="rounded-full p-1 text-muted transition hover:bg-white hover:text-ink">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-white">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="New photo preview" className="size-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[10px] text-muted">{busy ? "Resizing…" : "Preview"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0"
          >
            <Upload className="size-4" aria-hidden /> {photo ? "Choose another" : "Choose picture"}
          </button>
          <input ref={fileInput} type="file" accept="image/*" onChange={onFile} className="sr-only" />
          <p className="mt-1 text-xs text-muted">PNG or JPG. Resized to 512×512 in your browser.</p>
          {fileError ? <p className="mt-1 text-xs font-semibold text-red-600">{fileError}</p> : null}
        </div>
      </div>

      <details className="mt-3 text-xs text-muted">
        <summary className="cursor-pointer font-semibold text-ink">Need the AI prompt again?</summary>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {PHOTO_STYLES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStyle(item.key)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${style === item.key ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <CopyButton text={buildPhotoPrompt(style)} className="h-9 px-4 text-xs" />
          {AI_TOOLS.map((tool) => (
            <a key={tool.name} href={tool.href} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-brand-deep">
              Open {tool.name}
            </a>
          ))}
        </div>
      </details>

      {state.error ? (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!photo || busy || pending}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-black text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-brand disabled:hover:text-ink"
      >
        <Check className="size-4" aria-hidden /> {pending ? "Saving…" : "Save new photo"}
      </button>
    </form>
  );
}
