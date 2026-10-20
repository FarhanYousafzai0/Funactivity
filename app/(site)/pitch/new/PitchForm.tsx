"use client";

import { Send } from "lucide-react";
import { useActionState, useState } from "react";
import { savePitchAction, type PitchFormState } from "@/app/actions/pitch";
import type { Pitch } from "@/db/queries";
import { RUBRIC } from "@/lib/scoring";
import { LIMITS } from "@/lib/validation";

const fieldClass =
  "mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-brand-deep focus:ring-4 focus:ring-brand/25";

type FieldKey = "title" | "problem" | "audience" | "solution";

const FIELDS: { key: FieldKey; label: string; help: string; placeholder: string; rows?: number }[] = [
  { key: "title", label: "Idea name", help: "Short and memorable.", placeholder: "e.g. ClinicBot for Nowshera" },
  {
    key: "problem",
    label: "The problem",
    help: "What goes wrong today? Tell it like a story from real life.",
    placeholder: "e.g. Small clinics miss half their calls, so patients wait or go elsewhere…",
    rows: 6,
  },
  { key: "audience", label: "Who has this problem?", help: "Be specific: shopkeepers, students, mothers, farmers…", placeholder: "e.g. Family clinics with one receptionist" },
  {
    key: "solution",
    label: "How AI solves it",
    help: "What does the AI do, step by step, and why is it better than today?",
    placeholder: "e.g. A WhatsApp agent answers in Urdu, books the slot, reminds the patient…",
    rows: 8,
  },
];

function Counter({ value, max }: { value: number; max: number }) {
  const left = max - value;
  const atLimit = left <= 0;
  const nearLimit = !atLimit && left <= Math.max(20, Math.round(max * 0.1));
  return (
    <span className={`mt-1 flex items-center justify-between gap-2 font-mono text-[10px] ${atLimit ? "font-bold text-red-600" : nearLimit ? "font-bold text-amber-600" : "text-muted"}`}>
      <span className="font-sans">{atLimit ? "Limit reached. Shorten this a little to keep typing." : nearLimit ? `${left} characters left` : ""}</span>
      <span>
        {value}/{max}
      </span>
    </span>
  );
}

export function PitchForm({ defaults }: { defaults: Pitch | null }) {
  const [state, formAction, pending] = useActionState<PitchFormState, FormData>(savePitchAction, { error: null });
  const [values, setValues] = useState<Record<FieldKey, string>>({
    title: defaults?.title ?? "",
    problem: defaults?.problem ?? "",
    audience: defaults?.audience ?? "",
    solution: defaults?.solution ?? "",
  });

  const complete = FIELDS.every((field) => values[field.key].trim().length > 0 && values[field.key].length <= LIMITS[field.key]);

  return (
    <form action={formAction} className="rise space-y-5">
      <section className="rounded-3xl border border-line bg-white/85 p-5 shadow-[0_24px_60px_rgba(7,17,13,0.06)] backdrop-blur sm:p-6">
        {FIELDS.map((field) => (
          <label key={field.key} className="mt-4 block text-sm font-semibold first:mt-0">
            {field.label}
            <span className="ml-2 font-normal text-muted">{field.help}</span>
            {field.rows ? (
              <textarea
                name={field.key}
                value={values[field.key]}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                rows={field.rows}
                maxLength={LIMITS[field.key]}
                required
                placeholder={field.placeholder}
                className={`${fieldClass} resize-y`}
              />
            ) : (
              <input
                name={field.key}
                value={values[field.key]}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                maxLength={LIMITS[field.key]}
                required
                placeholder={field.placeholder}
                className={fieldClass}
              />
            )}
            <Counter value={values[field.key].length} max={LIMITS[field.key]} />
          </label>
        ))}
      </section>

      <aside className="rounded-3xl border border-dashed border-line bg-mint/50 p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">What the judges score · 1 to 5 each</p>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {RUBRIC.map((item) => (
            <li key={item.key}>
              <span className="font-bold">{item.label}.</span> <span className="text-muted">{item.hint}</span>
            </li>
          ))}
        </ul>
      </aside>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!complete || pending}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-base font-black text-ink shadow-[0_18px_48px_rgba(0,239,139,0.25)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-brand disabled:hover:text-ink"
      >
        <Send className="size-4" aria-hidden /> {pending ? "Sending to the judges…" : defaults ? "Save changes" : "Submit my pitch"}
      </button>
    </form>
  );
}
