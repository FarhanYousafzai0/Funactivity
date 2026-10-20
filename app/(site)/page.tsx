import Link from "next/link";
import { forgetProfileAction } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";
import { getPitchForProfile, getProfile, listProfiles, stats } from "@/db/queries";
import { currentProfileId } from "@/lib/auth";
import { firstName } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const primaryButton =
  "inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 text-[15px] font-bold text-ink shadow-[0_18px_48px_rgba(0,239,139,0.25)] transition hover:-translate-y-0.5 hover:bg-ink hover:text-white";
const ghostButton =
  "inline-flex h-12 items-center justify-center rounded-full border border-line bg-white/80 px-6 text-[15px] font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-deep";

export default async function HomePage() {
  // All of this runs on the server: the cookie is read, the database is queried,
  // and the browser receives finished HTML.
  const profileId = await currentProfileId();
  const [me, myPitch, profiles, counts] = await Promise.all([
    profileId ? getProfile(profileId) : null,
    profileId ? getPitchForProfile(profileId) : null,
    listProfiles(),
    stats(),
  ]);
  const signedIn = me && !me.hidden ? me : null;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">AI SKOOL × NextGen AI Bootcamp · Fun activity</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">Pitch Arena</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            Create your profile with an AI-made photo, then pitch a business idea that solves a real-life problem. Two minutes, no slides. The
            judges score every pitch live.
          </p>
        </div>

        {signedIn ? (
          <div className="rounded-3xl border border-line bg-white/85 p-6 shadow-[0_24px_60px_rgba(7,17,13,0.08)] backdrop-blur">
            <div className="flex items-center gap-4">
              <Avatar profile={signedIn} size="lg" />
              <div>
                <p className="text-sm text-muted">Welcome back</p>
                <p className="text-2xl font-black">{firstName(signedIn.name)}</p>
                {signedIn.tagline ? <p className="text-sm text-muted">{signedIn.tagline}</p> : null}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {!myPitch ? (
                <>
                  <Link href="/pitch/new" className={primaryButton}>
                    Pitch your idea
                  </Link>
                  <Link href={`/profile/${signedIn.id}`} className={ghostButton}>
                    My profile
                  </Link>
                </>
              ) : myPitch.score ? (
                <>
                  <Link href="/board" className={primaryButton}>
                    Judges gave you {myPitch.total}/{MAX_TOTAL} · see the board
                  </Link>
                  <Link href={`/pitch/${myPitch.pitch.id}`} className={ghostButton}>
                    My pitch
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/pitch/${myPitch.pitch.id}`} className={primaryButton}>
                    My pitch: {myPitch.pitch.title}
                  </Link>
                  <Link href="/pitch/new" className={ghostButton}>
                    Edit pitch
                  </Link>
                </>
              )}
            </div>
            <form action={forgetProfileAction} className="mt-4">
              <button type="submit" className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
                Not {firstName(signedIn.name)}? Start over on this device
              </button>
            </form>
          </div>
        ) : (
          <ol className="grid gap-3">
            <li className="rounded-3xl border border-line bg-white/85 p-5 shadow-[0_24px_60px_rgba(7,17,13,0.08)] backdrop-blur">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-brand-deep">Step 1</p>
              <h2 className="mt-1 text-xl font-black">Create your profile</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Your name and a profile photo you generate with ChatGPT or Gemini. Takes two minutes.</p>
              <Link href="/profile/new" className={`${primaryButton} mt-4 w-full sm:w-auto`}>
                Create my profile
              </Link>
            </li>
            <li className="rounded-3xl border border-dashed border-line bg-white/50 p-5">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Step 2 · optional</p>
              <h2 className="mt-1 text-xl font-black text-ink/70">Pitch your idea</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Unlocks after your profile. The problem, who has it, and how AI solves it.</p>
            </li>
          </ol>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">In the arena</h2>
            <p className="text-sm text-muted">Everyone who has created a profile so far.</p>
          </div>
          <Link href="/board" className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold">
            <span className="live-dot" /> Open the live board
          </Link>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Profiles", counts.profiles],
            ["Pitches", counts.pitches],
            ["Scored", counts.scored],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-white/80 px-4 py-3">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
              <dd className="text-3xl font-black">{value}</dd>
            </div>
          ))}
        </dl>

        {profiles.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center text-muted">Nobody yet. Be the first one in.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <Link href={profile.pitchId ? `/pitch/${profile.pitchId}` : `/profile/${profile.id}`} className="group flex flex-col items-center gap-2 text-center">
                  <Avatar profile={profile} size="md" className="transition group-hover:-translate-y-1" />
                  <span className="line-clamp-2 text-sm font-semibold leading-tight">{profile.name}</span>
                  {profile.scored ? (
                    <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand">Scored</span>
                  ) : profile.pitchId ? (
                    <span className="rounded-full bg-brand/30 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">Pitched</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
