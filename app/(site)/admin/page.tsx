import type { Metadata } from "next";
import Link from "next/link";
import { adminLogoutAction, setProfileHiddenAction } from "@/app/actions/admin";
import { Avatar } from "@/components/Avatar";
import { Boundary } from "@/components/Boundary";
import { leaderboard, listProfiles, stats } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";
import { ScoreForm } from "./ScoreForm";

export const metadata: Metadata = { title: "Judges" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin("/admin");
  const [entries, profiles, counts] = await Promise.all([leaderboard({ includeHidden: true }), listProfiles({ includeHidden: true }), stats()]);
  const ranked = entries.filter((entry) => entry.rank !== null && !entry.profile.hidden);
  const toScore = entries.filter((entry) => entry.rank === null && !entry.profile.hidden);
  const scoredEntries = entries.filter((entry) => entry.rank !== null);

  return (
    <div className="space-y-10">
      <Boundary kind="server" label="admin page: the cookie is checked on the server before any data is read">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Judges&apos; desk</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Score the pitches</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/board" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white">
              <span className="live-dot" /> Open the live board
            </Link>
            <form action={adminLogoutAction}>
              <button type="submit" className="inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <dl className="mt-6 grid grid-cols-3 gap-3">
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
      </Boundary>

      <Boundary kind="server" label="current ranking">
        <section>
          <h2 className="text-2xl font-black">Ranking</h2>
          {ranked.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-line p-5 text-sm text-muted">Nothing scored yet. Score a pitch below and it appears here and on the board.</p>
          ) : (
            <ol className="mt-3 divide-y divide-line rounded-3xl border border-line bg-white/85">
              {ranked.map((entry) => (
                <li key={entry.pitch.id} className={`flex items-center gap-4 px-5 py-3 ${entry.rank === 1 ? "bg-brand/15" : ""}`}>
                  <span className="w-8 font-mono text-lg font-black text-muted">{entry.rank}</span>
                  <Avatar profile={entry.profile} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {entry.profile.name} {entry.rank === 1 ? <span className="ml-1 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] uppercase text-brand">Leading</span> : null}
                    </p>
                    <p className="truncate text-sm text-muted">{entry.pitch.title}</p>
                  </div>
                  <span className="text-2xl font-black">
                    {entry.total}
                    <span className="text-xs text-muted">/{MAX_TOTAL}</span>
                  </span>
                  <a href={`#pitch-${entry.pitch.id}`} className="text-xs font-semibold text-muted underline-offset-4 hover:underline">
                    Edit
                  </a>
                </li>
              ))}
            </ol>
          )}
        </section>
      </Boundary>

      <section>
        <h2 className="text-2xl font-black">
          To score <span className="text-muted">· {toScore.length}</span>
        </h2>
        {toScore.length === 0 ? <p className="mt-3 text-sm text-muted">No unscored pitches right now.</p> : null}
        <div className="mt-3 grid gap-4">
          {[...toScore, ...scoredEntries].map((entry) => (
            <article key={entry.pitch.id} id={`pitch-${entry.pitch.id}`} className={`rounded-3xl border border-line bg-white/85 p-5 sm:p-6 ${entry.profile.hidden ? "opacity-60" : ""}`}>
              <Boundary kind="server" label="pitch text from the database">
                <header className="flex items-start gap-4">
                  <Avatar profile={entry.profile} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted">
                      {entry.profile.name}
                      {entry.profile.tagline ? ` · ${entry.profile.tagline}` : ""} · {formatTime(entry.pitch.createdAt)}
                      {entry.profile.hidden ? " · HIDDEN" : ""}
                    </p>
                    <h3 className="text-xl font-black">{entry.pitch.title}</h3>
                  </div>
                  <Link href={`/pitch/${entry.pitch.id}`} className="text-xs font-semibold text-muted underline-offset-4 hover:underline">
                    Open
                  </Link>
                </header>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  {[
                    ["Problem", entry.pitch.problem],
                    ["Who has it", entry.pitch.audience],
                    ["AI solution", entry.pitch.solution],
                  ].map(([label, text]) => (
                    <div key={label} className="rounded-2xl bg-mint/60 p-3">
                      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-brand-deep">{label}</dt>
                      <dd className="mt-1 whitespace-pre-line leading-6">{text}</dd>
                    </div>
                  ))}
                </dl>
              </Boundary>
              <div className="mt-4">
                <ScoreForm pitchId={entry.pitch.id} existing={entry.score} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <Boundary kind="server" label="every profile, including hidden ones">
        <section>
          <h2 className="text-2xl font-black">
            Profiles <span className="text-muted">· {profiles.length}</span>
          </h2>
          <p className="text-sm text-muted">Hide a profile to remove it from the arena, the board and its photo link. Nothing is deleted.</p>
          <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-white/85">
            {profiles.map((profile) => (
              <li key={profile.id} className={`flex items-center gap-3 px-4 py-2.5 ${profile.hidden ? "opacity-60" : ""}`}>
                <Avatar profile={profile} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {profile.name} <span className="font-normal text-muted">· {formatTime(profile.createdAt)}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {profile.tagline ?? ""}
                    {profile.scored ? " · scored" : profile.pitchId ? " · pitched" : " · no pitch yet"}
                    {profile.hidden ? " · hidden" : ""}
                  </p>
                </div>
                <Link href={`/profile/${profile.id}`} className="text-xs font-semibold text-muted underline-offset-4 hover:underline">
                  Open
                </Link>
                <form action={setProfileHiddenAction}>
                  <input type="hidden" name="profileId" value={profile.id} />
                  <input type="hidden" name="hidden" value={profile.hidden ? "0" : "1"} />
                  <button type="submit" className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold hover:border-brand-deep">
                    {profile.hidden ? "Unhide" : "Hide"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </Boundary>
    </div>
  );
}
