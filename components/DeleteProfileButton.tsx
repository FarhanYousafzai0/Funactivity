"use client";

import { Trash2 } from "lucide-react";
import { deleteProfileAction } from "@/app/actions/admin";

/** Asks before deleting, because this removes the student, their pitch and score for good. */
export function DeleteProfileButton({
  profileId,
  name,
  next,
  size = "sm",
}: {
  profileId: string;
  name: string;
  /** Admin path to land on afterwards (used from the pitch detail page, which disappears with the student). */
  next?: string;
  size?: "sm" | "md";
}) {
  const sizing = size === "md" ? "h-11 px-5 text-sm" : "h-8 px-3 text-xs";
  return (
    <form
      action={deleteProfileAction}
      onSubmit={(event) => {
        if (!confirm(`Delete ${name}, their pitch and score? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="profileId" value={profileId} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <button
        type="submit"
        title="Delete this student, their pitch and score"
        className={`inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white font-semibold text-red-700 transition hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-50 active:translate-y-0 active:scale-[0.97] ${sizing}`}
      >
        <Trash2 className={size === "md" ? "size-4" : "size-3.5"} aria-hidden /> Delete
      </button>
    </form>
  );
}
