import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { forgetProfileAction } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";
import { getPitchForProfile, getProfile } from "@/db/queries";
import { currentProfileId, isAdmin } from "@/lib/auth";
import { firstName, formatTime } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";
import { isValidId } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ welcome?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = isValidId(id) ? await getProfile(id) : null;
  return { title: profile ? profile.name : "Profile" };
}

const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-bold text-ink shadow-[0_18px_48px_rgba(0,239,139,0.25)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white";
const ghostButton = "inline-flex h-12 items-center justify-center rounded-full border border-line bg-white px-6 font-semibold transition hover:border-brand-deep";

export default async function ProfilePage({ params, searchParams }: Props) {
  const [{ id }, { welcome }] = await Promise.all([params, searchParams]);
  if (!isValidId(id)) notFound();

  const [profile, viewerId, admin] = await Promise.all([getProfile(id), currentProfileId(), isAdmin()]);
  if (!profile || (profile.hidden && !admin)) notFound();

  const owner = viewerId === profile.id;
  const entry = await getPitchForProfile(profile.id);

  return (
    <section className="mx-auto max-w-lg">
      {welcome && owner ? (
        <p className="mb-4 rounded-2xl border border-brand-deep/30 bg-brand/15 px-4 py-3 text-center text-sm font-semibold">
          You are in the arena, {firstName(profile.name)}! Your profile is saved on the server.
        </p>
      ) : null}

      <div className="rounded-3xl border border-line bg-white/85 p-8 text-center shadow-[0_24px_60px_rgba(7,17,13,0.08)] backdrop-blur">
        <Avatar profile={profile} size="xl" className="mx-auto" />
        <h1 className="mt-5 text-3xl font-black tracking-tight">{profile.name}</h1>
        {profile.tagline ? <p className="mt-1 text-muted">{profile.tagline}</p> : null}
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          Joined at {formatTime(profile.createdAt)}
          {profile.hidden ? " · hidden by the judges" : ""}
        </p>

        {entry ? (
          <div className="mt-6 rounded-2xl border border-line bg-mint/60 p-4 text-left">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">{entry.score ? `Scored ${entry.total}/${MAX_TOTAL}` : "Pitched"}</p>
            <p className="mt-1 text-lg font-black">{entry.pitch.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{entry.pitch.problem}</p>
            <Link href={`/pitch/${entry.pitch.id}`} className="mt-3 inline-block text-sm font-bold underline-offset-4 hover:underline">
              Read the pitch →
            </Link>
          </div>
        ) : null}

        {owner ? (
          <div className="mt-6 flex flex-col gap-3">
            {!entry ? (
              <>
                <Link href="/pitch/new" className={primaryButton}>
                  Pitch your idea now
                </Link>
                <Link href="/" className={ghostButton}>
                  Maybe later
                </Link>
                <p className="text-xs text-muted">Pitching is optional. You can come back from the home page any time on this device.</p>
              </>
            ) : !entry.score ? (
              <Link href="/pitch/new" className={ghostButton}>
                Edit my pitch
              </Link>
            ) : null}
            <form action={forgetProfileAction}>
              <button type="submit" className="text-xs text-muted underline-offset-4 hover:underline">
                Not you? Start over on this device
              </button>
            </form>
          </div>
        ) : (
          <Link href="/" className={`${ghostButton} mt-6`}>
            Back to the arena
          </Link>
        )}
      </div>
    </section>
  );
}
