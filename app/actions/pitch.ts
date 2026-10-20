"use server";

import { redirect } from "next/navigation";
import { getPitchForProfile, savePitch } from "@/db/queries";
import { currentProfileId } from "@/lib/auth";
import { cleanText, LIMITS, textError } from "@/lib/validation";

export type PitchFormState = { error: string | null };

export async function savePitchAction(_previous: PitchFormState, formData: FormData): Promise<PitchFormState> {
  // Only the browser that owns a profile can pitch for it.
  const profileId = await currentProfileId();
  if (!profileId) redirect("/profile/new?next=/pitch/new");

  const title = cleanText(formData.get("title"));
  const problem = cleanText(formData.get("problem"));
  const audience = cleanText(formData.get("audience"));
  const solution = cleanText(formData.get("solution"));

  const error =
    textError(title, "Idea name", LIMITS.title) ??
    textError(problem, "The problem", LIMITS.problem) ??
    textError(audience, "Who has this problem", LIMITS.audience) ??
    textError(solution, "How AI solves it", LIMITS.solution);
  if (error) return { error };

  // Once the judges have scored a pitch it is frozen.
  const existing = await getPitchForProfile(profileId);
  if (existing?.score) return { error: "The judges already scored your pitch, so it can no longer be edited." };

  const id = await savePitch({ profileId, title, problem, audience, solution });
  redirect(`/pitch/${id}?saved=1`);
}
