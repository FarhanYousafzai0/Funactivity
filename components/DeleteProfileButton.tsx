"use client";

import { deleteProfileAction } from "@/app/actions/admin";

/** Asks before deleting, because this removes the student, their pitch and score for good. */
export function DeleteProfileButton({ profileId, name, className = "" }: { profileId: string; name: string; className?: string }) {
  return (
    <form
      action={deleteProfileAction}
      onSubmit={(event) => {
        if (!confirm(`Delete ${name}, their pitch and score? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="profileId" value={profileId} />
      <button
        type="submit"
        className={`rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 transition hover:border-red-500 hover:bg-red-50 ${className}`}
      >
        Delete
      </button>
    </form>
  );
}
