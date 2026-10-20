import type { Metadata } from "next";
import Link from "next/link";
import { forgetProfileAction } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";
import { getProfile } from "@/db/queries";
import { currentProfileId } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Create your profile" };
export const dynamic = "force-dynamic";

export default async function NewProfilePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const profileId = await currentProfileId();
  const existing = profileId ? await getProfile(profileId) : null;

  if (existing && !existing.hidden) {
    return (
      <section className="mx-auto max-w-md rounded-3xl border border-line bg-white/85 p-6 text-center shadow-[0_24px_60px_rgba(7,17,13,0.08)]">
        <Avatar profile={existing} size="lg" className="mx-auto" />
        <h1 className="mt-4 text-2xl font-black">You already have a profile, {existing.name.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-muted">This device is linked to it. Head to your pitch, or start over if this is not you.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Link href="/pitch/new" className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-bold text-ink">
            Pitch your idea
          </Link>
          <Link href={`/profile/${existing.id}`} className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-6 font-semibold">
            View my profile
          </Link>
          <form action={forgetProfileAction}>
            <button type="submit" className="text-xs text-muted underline-offset-4 hover:underline">
              Not you? Start over on this device
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Step 1 of 2</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Create your profile</h1>
      <p className="mt-2 text-muted">Your name, and a profile photo you make with AI. No account, no password: this device remembers you.</p>
      <div className="mt-8">
        <ProfileForm next={next ?? ""} />
      </div>
    </div>
  );
}
