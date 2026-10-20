"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProfile, getPitch, saveScore, setProfileHidden } from "@/db/queries";
import { ADMIN_COOKIE, adminPasswordValid, adminToken, cookieOptions, isAdmin } from "@/lib/auth";
import { parseScore } from "@/lib/scoring";
import { cleanText, isValidId, LIMITS, textError } from "@/lib/validation";

export type AdminFormState = { error: string | null; savedAt?: string };

function safeNext(value: unknown) {
  return typeof value === "string" && /^\/admin(\/[\w\-/?=&]*)?$/.test(value) ? value : "/admin";
}

export async function adminLoginAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD is not set on the server. Add it to .env.local and restart." };
  // A small fixed delay keeps password guessing slow without a database table for attempts.
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (!password || !adminPasswordValid(password)) return { error: "Wrong password." };

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminToken()!, cookieOptions(60 * 60 * 12));
  redirect(safeNext(formData.get("next")));
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function scorePitchAction(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "Your admin session ended. Sign in again." };

  const pitchId = formData.get("pitchId");
  if (!isValidId(pitchId) || !(await getPitch(pitchId))) return { error: "That pitch no longer exists." };

  const score = parseScore((key) => formData.get(key));
  if (!score) return { error: "Give every criterion a score from 1 to 5." };

  const note = cleanText(formData.get("note"));
  const noteError = textError(note, "Note", LIMITS.note, false);
  if (noteError) return { error: noteError };

  await saveScore(pitchId, score, note || null);
  revalidatePath("/admin");
  revalidatePath("/board");
  revalidatePath(`/pitch/${pitchId}`);
  return { error: null, savedAt: new Date().toISOString() };
}

export async function setProfileHiddenAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login?next=/admin");
  const id = formData.get("profileId");
  if (!isValidId(id)) return;
  await setProfileHidden(id, formData.get("hidden") === "1");
  revalidatePath("/admin");
  revalidatePath("/board");
  revalidatePath("/");
}

/** Judges only: deletes the student, their pitch and score. Used to clear test accounts. */
export async function deleteProfileAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login?next=/admin");
  const id = formData.get("profileId");
  if (!isValidId(id)) return;
  await deleteProfile(id);
  revalidatePath("/admin");
  revalidatePath("/board");
  revalidatePath("/");
}
