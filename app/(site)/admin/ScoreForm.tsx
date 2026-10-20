"use client";

import { CircleCheck, Save } from "lucide-react";
import { useActionState } from "react";
import { scorePitchAction, type AdminFormState } from "@/app/actions/admin";
import type { Score } from "@/db/queries";
import { RUBRIC, SCORE_MAX, SCORE_MIN } from "@/lib/scoring";
import { LIMITS } from "@/lib/validation";

const marks = Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, index) => SCORE_MIN + index);

export function ScoreForm({ pitchId, existing }: { pitchId: string; existing: Score | null }) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(scorePitchAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="pitchId" value={pitchId} />
      <div className="grid gap-4">
        {RUBRIC.map((item) => (
          <fieldset key={item.key}>
            <legend className="text-sm font-bold">
              {item.label} <span className="font-normal text-muted">· {item.hint}</span>
            </legend>
            <div className="mt-2 flex gap-1.5">
              {marks.map((mark) => (
                <label key={mark} className="flex-1">
                  <input type="radio" name={item.key} value={mark} defaultChecked={existing?.[item.key] === mark} required className="peer sr-only" />
                  <span className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-line bg-white text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand-deep active:scale-95 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30">
                    {mark}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <label className="block text-sm font-bold">
        Note for the student <span className="font-normal text-muted">(optional, shown to them)</span>
        <input
          name="note"
          defaultValue={existing?.note ?? ""}
          maxLength={LIMITS.note}
          placeholder="e.g. Strong problem. Explain the AI part in one sentence next time."
          className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-deep focus:ring-4 focus:ring-brand/25"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-black text-ink shadow-[0_18px_48px_rgba(0,239,139,0.25)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : existing ? "Update score" : "Save score"}
        </button>
        {state.error ? (
          <span role="alert" className="text-sm font-semibold text-red-600">
            {state.error}
          </span>
        ) : null}
        {!state.error && state.savedAt ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-deep">
            <CircleCheck className="size-4" aria-hidden /> Saved. The board updates within 10 seconds.
          </span>
        ) : null}
      </div>
    </form>
  );
}
