import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { getPitchForProfile, getProfile } from "@/db/queries";
import { currentProfileId } from "@/lib/auth";
import { firstName } from "@/lib/format";
import { PitchForm } from "./PitchForm";

export const metadata: Metadata = { title: "Pitch your idea" };
export const dynamic = "force-dynamic";

export default async function NewPitchPage() {
  // No profile cookie → go make a profile first, then come straight back here.
  const profileId = await currentProfileId();
  if (!profileId) redirect("/profile/new?next=/pitch/new");
  const profile = await getProfile(profileId);
  if (!profile || profile.hidden) redirect("/profile/new?next=/pitch/new");

  const entry = await getPitchForProfile(profile.id);
  if (entry?.score) redirect(`/pitch/${entry.pitch.id}`);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4">
        <Avatar profile={profile} size="md" />
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Step 2 of 2 · pitching as {firstName(profile.name)}</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">{entry ? "Edit your pitch" : "Pitch your idea"}</h1>
        </div>
      </div>
      <p className="mt-3 text-muted">
        Think Shark Tank, two minutes, no slides. A real problem you or people around you face, and how AI could solve it.
      </p>
      <div className="mt-8">
        <PitchForm defaults={entry?.pitch ?? null} />
      </div>
    </div>
  );
}
