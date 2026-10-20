"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { adminLoginAction, type AdminFormState } from "@/app/actions/admin";

export function AdminLoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(adminLoginAction, { error: null });
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-semibold">
        Password
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-brand-deep focus:ring-4 focus:ring-brand/25"
        />
      </label>
      {state.error ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0 active:scale-[0.98] disabled:opacity-50">
        <LogIn className="size-4" aria-hidden /> {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
