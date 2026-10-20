import type { Metadata } from "next";
import { Eye, EyeOff, ExternalLink, Hourglass, Lightbulb, LogOut, QrCode, Radio, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { adminLogoutAction, setProfileHiddenAction } from "@/app/actions/admin";
import { Avatar } from "@/components/Avatar";
import { DeleteProfileButton } from "@/components/DeleteProfileButton";
import { Pagination } from "@/components/Pagination";
import { leaderboard, listProfiles, stats } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { paginate, parsePage } from "@/lib/paginate";
import { INTEREST_OPTIONS, labelsFor, STUDY_OPTIONS } from "@/lib/profile-options";
import { MAX_TOTAL, RUBRIC } from "@/lib/scoring";

export const metadata: Metadata = { title: "Judges" };
export const dynamic = "force-dynamic";

type Params = { ranking?: string; pitches?: string; students?: string };

const viewButton =
  "inline-flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0 active:scale-[0.97]";
const smallButton =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0 active:scale-[0.97]";
const th = "px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin("/admin");
  const params = await searchParams;
  const [entries, profiles, counts] = await Promise.all([leaderboard({ includeHidden: true }), listProfiles({ includeHidden: true }), stats()]);

  const visible = entries.filter((entry) => !entry.profile.hidden);
  const rankedAll = visible.filter((entry) => entry.rank !== null);
  const unscored = visible.filter((entry) => entry.rank === null);
  // Pitches to work through: unscored first (oldest first), then the scored ones.
  const pitchList = [...unscored, ...rankedAll, ...entries.filter((entry) => entry.profile.hidden)];

  const ranking = paginate(rankedAll, parsePage(params.ranking));
  const pitches = paginate(pitchList, parsePage(params.pitches));
  const students = paginate(profiles, parsePage(params.students));

  const href = (key: keyof Params) => (page: number) => {
    const next = new URLSearchParams();
    for (const [name, value] of Object.entries({ ...params, [key]: String(page) })) if (value && value !== "1") next.set(name, value);
    const query = next.toString();
    return `/admin${query ? `?${query}` : ""}#${key}`;
  };

  return (
    <div className="space-y-10">
      <header className="rise flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Judges&apos; desk</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Score the pitches</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/join" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0">
            <QrCode className="size-4" aria-hidden /> Join QR
          </Link>
          <Link href="/board" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0">
            <Radio className="size-4 text-brand" aria-hidden /> Live board
          </Link>
          <form action={adminLogoutAction}>
            <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </header>

      <dl className="rise rise-2 grid grid-cols-3 gap-3">
        {[
          { label: "Profiles", value: counts.profiles, Icon: Users },
          { label: "Pitches", value: counts.pitches, Icon: Lightbulb },
          { label: "Scored", value: counts.scored, Icon: Star },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="lift flex items-center justify-between rounded-2xl border border-line bg-white/80 px-4 py-3">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</dt>
              <dd className="text-3xl font-black">{value}</dd>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-brand/20 text-brand-deep">
              <Icon className="size-5" aria-hidden />
            </span>
          </div>
        ))}
      </dl>

      {/* Ranking */}
      <section id="ranking" className="rise rise-3 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-brand-deep" aria-hidden />
          <h2 className="text-2xl font-black">Ranking</h2>
          <span className="text-muted">· {rankedAll.length}</span>
        </div>
        {rankedAll.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-white/50 p-5 text-sm text-muted">Nothing scored yet. Open a pitch below to give the first score.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-3xl border border-line bg-white/85 shadow-[0_20px_55px_rgba(14,50,33,0.06)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={`${th} w-14`}>#</th>
                  <th className={th}>Student</th>
                  <th className={th}>Pitch idea</th>
                  <th className={th}>Breakdown</th>
                  <th className={`${th} w-24 text-right`}>Score</th>
                  <th className={`${th} w-24`} />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ranking.items.map((entry) => (
                  <tr key={entry.pitch.id} className={`row-hover ${entry.rank === 1 ? "bg-brand/15" : ""}`}>
                    <td className="px-4 py-3 font-mono text-lg font-black text-muted">{entry.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar profile={entry.profile} size="sm" />
                        <div>
                          <p className="font-bold">
                            {entry.profile.name}
                            {entry.rank === 1 ? <span className="ml-2 rounded-full bg-ink px-2 py-0.5 align-middle font-mono text-[9px] uppercase text-brand">Leading</span> : null}
                          </p>
                          {entry.profile.tagline ? <p className="text-xs text-muted">{entry.profile.tagline}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-deep">{entry.pitch.title}</p>
                      <p className="text-xs leading-5 text-muted">{entry.pitch.problem}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                        {RUBRIC.map((item) => (
                          <li key={item.key}>
                            {item.label} <strong className="text-ink">{entry.score![item.key]}</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-2xl font-black">
                      {entry.total}
                      <span className="text-xs text-muted">/{MAX_TOTAL}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/pitch/${entry.pitch.id}`} className={viewButton}>
                        <Eye className="size-3.5" aria-hidden /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pb-3">
              <Pagination page={ranking.page} pageCount={ranking.pageCount} total={ranking.total} hrefFor={href("ranking")} label="ranked" />
            </div>
          </div>
        )}
      </section>

      {/* Pitches */}
      <section id="pitches" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-5 text-brand-deep" aria-hidden />
          <h2 className="text-2xl font-black">Pitches</h2>
          <span className="text-muted">· {unscored.length} waiting for a score</span>
        </div>
        {pitchList.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-white/50 p-5 text-sm text-muted">No pitches yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-3xl border border-line bg-white/85 shadow-[0_20px_55px_rgba(14,50,33,0.06)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Student</th>
                  <th className={th}>Pitch idea</th>
                  <th className={`${th} w-28`}>Submitted</th>
                  <th className={`${th} w-32`}>Status</th>
                  <th className={`${th} w-44`} />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pitches.items.map((entry) => (
                  <tr key={entry.pitch.id} className={`row-hover ${entry.profile.hidden ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar profile={entry.profile} size="sm" />
                        <div>
                          <p className="font-bold">{entry.profile.name}</p>
                          {entry.profile.tagline ? <p className="text-xs text-muted">{entry.profile.tagline}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{entry.pitch.title}</p>
                      <p className="line-clamp-1 text-xs text-muted">{entry.pitch.problem}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatTime(entry.pitch.createdAt)}</td>
                    <td className="px-4 py-3">
                      {entry.profile.hidden ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-line px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted">
                          <EyeOff className="size-3" aria-hidden /> Hidden
                        </span>
                      ) : entry.score ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brand">
                          <Star className="size-3" aria-hidden /> {entry.total}/{MAX_TOTAL}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/30 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">
                          <Hourglass className="size-3" aria-hidden /> Needs score
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/pitch/${entry.pitch.id}`} className={viewButton}>
                          <Eye className="size-3.5" aria-hidden /> {entry.score ? "View" : "Score"}
                        </Link>
                        <DeleteProfileButton profileId={entry.profile.id} name={entry.profile.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pb-3">
              <Pagination page={pitches.page} pageCount={pitches.pageCount} total={pitches.total} hrefFor={href("pitches")} label="pitches" />
            </div>
          </div>
        )}
      </section>

      {/* Students */}
      <section id="students" className="scroll-mt-24">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-brand-deep" aria-hidden />
          <h2 className="text-2xl font-black">Students</h2>
          <span className="text-muted">· {profiles.length}</span>
        </div>
        <p className="mt-1 text-sm text-muted">Hide removes a student from the arena and the board without deleting anything. Delete removes them, their pitch and score for good.</p>
        <div className="mt-3 overflow-x-auto rounded-3xl border border-line bg-white/85 shadow-[0_20px_55px_rgba(14,50,33,0.06)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Student</th>
                <th className={th}>Studying · wants to become</th>
                <th className={`${th} w-28`}>Joined</th>
                <th className={`${th} w-32`}>Status</th>
                <th className={`${th} w-60`} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.items.map((profile) => (
                <tr key={profile.id} className={`row-hover ${profile.hidden ? "opacity-60" : ""}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar profile={profile} size="sm" />
                      <div>
                        <p className="font-bold">{profile.name}</p>
                        {profile.tagline ? <p className="text-xs text-muted">{profile.tagline}</p> : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <p className="text-ink">{labelsFor(STUDY_OPTIONS, profile.studies).join(", ") || <span className="text-muted">–</span>}</p>
                    <p className="text-muted">{labelsFor(INTEREST_OPTIONS, profile.interests).join(", ")}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted">{formatTime(profile.createdAt)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted">
                    {profile.hidden ? "Hidden" : profile.scored ? "Scored" : profile.pitchId ? "Pitched" : "No pitch yet"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/profile/${profile.id}`} className={smallButton}>
                        <ExternalLink className="size-3.5" aria-hidden /> Profile
                      </Link>
                      <form action={setProfileHiddenAction}>
                        <input type="hidden" name="profileId" value={profile.id} />
                        <input type="hidden" name="hidden" value={profile.hidden ? "0" : "1"} />
                        <button type="submit" className={smallButton}>
                          {profile.hidden ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                          {profile.hidden ? "Unhide" : "Hide"}
                        </button>
                      </form>
                      <DeleteProfileButton profileId={profile.id} name={profile.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {students.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">
                    No students yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <div className="px-4 pb-3">
            <Pagination page={students.page} pageCount={students.pageCount} total={students.total} hrefFor={href("students")} label="students" />
          </div>
        </div>
      </section>
    </div>
  );
}
