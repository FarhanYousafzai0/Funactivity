"use client";

import { useActionState } from "react";
import { scorePitchAction, type AdminFormState } from "@/app/actions/admin";
import type { Score } from "@/db/queries";
import { RUBRIC, SCORE_MAX, SCORE_MIN } from "@/lib/scoring";
import { LIMITS } from "@/lib/validation";

const marks = Array.from({ length: SCORE_MAX - SCORE_MIN + 1 }, (_, index) => SCORE_MIN + index);

export function ScoreForm({ pitchId, existing }: { pitchId: string; existing: Score | null }) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(scorePitchAction, { error: null });

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-white p-4">
      <input type="hidden" name="pitchId" value={pitchId} />
      <div className="grid gap-3 sm:grid-cols-2">
        {RUBRIC.map((item) => (
          <fieldset key={item.key}>
            <legend className="text-sm font-bold">
              {item.label} <span className="font-normal text-muted">· {item.hint}</span>
            </legend>
            <div className="mt-1.5 flex gap-1">
              {marks.map((mark) => (
                <label key={mark} className="flex-1">
                  <input type="radio" name={item.key} value={mark} defaultChecked={existing?.[item.key] === mark} required className="peer sr-only" />
                  <span className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-line text-sm font-bold transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30 hover:border-brand-deep">
                    {mark}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <label className="mt-3 block text-sm font-semibold">
        Note for the student <span className="font-normal text-muted">(optional, shown to them)</span>
        <input
          name="note"
          defaultValue={existing?.note ?? ""}
          maxLength={LIMITS.note}
          placeholder="e.g. Strong problem. Explain the AI part in one sentence next time."
          className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand-deep"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-black text-ink disabled:opacity-50">
          {pending ? "Saving…" : existing ? "Update score" : "Save score"}
        </button>
        {state.error ? <span className="text-sm font-semibold text-red-600">{state.error}</span> : null}
        {!state.error && state.savedAt ? <span className="text-sm font-semibold text-brand-deep">Saved. The board updates within 10 seconds.</span> : null}
      </div>
    </form>
  );
}
