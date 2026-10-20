import Link from "next/link";
import { forgetProfileAction } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";
import { getPitchForProfile, getProfile, leaderboard, listProfiles, stats } from "@/db/queries";
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
  const [me, myPitch, profiles, ranked, counts] = await Promise.all([
    profileId ? getProfile(profileId) : null,
    profileId ? getPitchForProfile(profileId) : null,
    listProfiles(),
    leaderboard(),
    stats(),
  ]);
  const signedIn = me && !me.hidden ? me : null;

  // One row per student: scored pitches first (by rank), then pitches waiting for the judges,
  // then students who have not pitched yet.
  const rows = [
    ...ranked.map((entry) => ({ profile: entry.profile, pitch: entry.pitch, total: entry.total, rank: entry.rank })),
    ...profiles.filter((profile) => !profile.pitchId).map((profile) => ({ profile, pitch: null, total: null, rank: null })),
  ];

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
            <p className="text-sm text-muted">Everyone who has created a profile, their pitch, and the judges&apos; score once it is given.</p>
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

        {rows.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center text-muted">Nobody yet. Be the first one in.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white/85 shadow-[0_20px_55px_rgba(14,50,33,0.06)]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="w-14 px-4 py-3">#</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Pitch idea</th>
                  <th className="w-32 px-4 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.profile.id} className={row.rank === 1 ? "bg-brand/15" : ""}>
                    <td className="px-4 py-3 font-mono text-lg font-black text-muted">{row.rank ?? "–"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/profile/${row.profile.id}`} className="flex items-center gap-3">
                        <Avatar profile={row.profile} size="sm" />
                        <span>
                          <span className="block font-bold">{row.profile.name}</span>
                          {row.profile.tagline ? <span className="block text-xs text-muted">{row.profile.tagline}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {row.pitch ? (
                        <Link href={`/pitch/${row.pitch.id}`} className="block">
                          <span className="block font-semibold text-brand-deep">{row.pitch.title}</span>
                          <span className="block text-xs leading-5 text-muted">{row.pitch.problem}</span>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">No pitch yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.total !== null ? (
                        <span className="font-mono text-2xl font-black">
                          {row.total}
                          <span className="text-xs text-muted">/{MAX_TOTAL}</span>
                        </span>
                      ) : row.pitch ? (
                        <span className="rounded-full bg-brand/30 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">Waiting</span>
                      ) : (
                        <span className="text-xs text-muted">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
