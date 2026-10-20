"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createProfile } from "@/db/queries";
import { cookieOptions, PROFILE_COOKIE, profileToken } from "@/lib/auth";
import { isPhotoStyle } from "@/lib/photo-prompt";
import { cleanText, LIMITS, photoError, textError } from "@/lib/validation";

export type ProfileFormState = { error: string | null };

/** Returns only paths inside this app, so a crafted ?next= can never send someone elsewhere. */
function safeNext(value: unknown, fallback: string) {
  return typeof value === "string" && /^\/(?!\/)[\w\-/?=&]*$/.test(value) ? value : fallback;
}

export async function createProfileAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const name = cleanText(formData.get("name"));
  const tagline = cleanText(formData.get("tagline"));
  const photo = formData.get("photo");
  const style = formData.get("photoStyle");

  const error =
    textError(name, "Your name", LIMITS.name) ??
    textError(tagline, "Tagline", LIMITS.tagline, false) ??
    photoError(photo) ??
    (isPhotoStyle(style) ? null : "Pick a photo style.");
  if (error) return { error };

  const id = await createProfile({ name, tagline: tagline || null, photo: photo as string, photoStyle: style as string });

  // The browser that created the profile owns it from now on.
  const jar = await cookies();
  jar.set(PROFILE_COOKIE, profileToken(id), cookieOptions());

  const next = safeNext(formData.get("next"), "");
  redirect(`/profile/${id}?welcome=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
}

/** "Not you?" — forgets the profile cookie on this device. The profile itself stays. */
export async function forgetProfileAction() {
  const jar = await cookies();
  jar.delete(PROFILE_COOKIE);
  redirect("/");
}
