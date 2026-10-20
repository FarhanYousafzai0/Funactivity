import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, ExternalLink, Eye, EyeOff, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setProfileHiddenAction } from "@/app/actions/admin";
import { Avatar } from "@/components/Avatar";
import { DeleteProfileButton } from "@/components/DeleteProfileButton";
import { getPitch, leaderboard } from "@/db/queries";
import { requireAdmin } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";
import { isValidId } from "@/lib/validation";
import { ScoreForm } from "../../ScoreForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = isValidId(id) ? await getPitch(id) : null;
  return { title: entry ? `Score · ${entry.profile.name}` : "Score" };
}

const smallButton =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0 active:scale-[0.97]";

export default async function AdminPitchPage({ params }: Props) {
  const { id } = await params;
  await requireAdmin(`/admin/pitch/${id}`);
  if (!isValidId(id)) notFound();

  const [entry, board] = await Promise.all([getPitch(id), leaderboard({ includeHidden: true })]);
  if (!entry) notFound();

  const { pitch, profile, score } = entry;
  const position = board.find((item) => item.pitch.id === pitch.id)?.rank ?? null;
  const ranked = board.filter((item) => item.rank !== null && !item.profile.hidden);
  const nextToScore = board.find((item) => item.rank === null && !item.profile.hidden && item.pitch.id !== pitch.id);

  return (
    <div className="space-y-8">
      <nav className="rise flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin#pitches" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> All pitches
        </Link>
        {nextToScore ? (
          <Link href={`/admin/pitch/${nextToScore.pitch.id}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0">
            Next to score: {nextToScore.profile.name} <ArrowRight className="size-4 text-brand" aria-hidden />
          </Link>
        ) : null}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* Student + pitch */}
        <article className="rise rise-2 space-y-4">
          <header className="lift flex items-start gap-4 rounded-3xl border border-line bg-white/85 p-5 sm:p-6">
            <Avatar profile={profile} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Pitch by</p>
              <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
              {profile.tagline ? <p className="text-sm text-muted">{profile.tagline}</p> : null}
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock className="size-3.5" aria-hidden /> Submitted {formatTime(pitch.createdAt)}
                {pitch.updatedAt !== pitch.createdAt ? `, edited ${formatTime(pitch.updatedAt)}` : ""}
                {profile.hidden ? " · hidden from the arena" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/pitch/${pitch.id}`} className={smallButton}>
                  <ExternalLink className="size-3.5" aria-hidden /> Public page
                </Link>
                <form action={setProfileHiddenAction}>
                  <input type="hidden" name="profileId" value={profile.id} />
                  <input type="hidden" name="pitchId" value={pitch.id} />
                  <input type="hidden" name="hidden" value={profile.hidden ? "0" : "1"} />
                  <button type="submit" className={smallButton}>
                    {profile.hidden ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    {profile.hidden ? "Unhide" : "Hide"}
                  </button>
                </form>
                <DeleteProfileButton profileId={profile.id} name={profile.name} next="/admin" />
              </div>
            </div>
          </header>

          <h2 className="px-1 text-2xl font-black tracking-tight">{pitch.title}</h2>
          {[
            ["The problem", pitch.problem],
            ["Who has it", pitch.audience],
            ["How AI solves it", pitch.solution],
          ].map(([label, text]) => (
            <section key={label} className="lift rounded-3xl border border-line bg-white/85 p-5">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">{label}</h3>
              <p className="mt-2 whitespace-pre-line leading-7">{text}</p>
            </section>
          ))}
        </article>

        {/* Scoring */}
        <aside className="rise rise-3 space-y-4 lg:sticky lg:top-6">
          <section className="rounded-3xl border border-line bg-white/90 p-5 shadow-[0_24px_60px_rgba(7,17,13,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">
                  <Star className="size-3.5" aria-hidden /> Judges&apos; score
                </p>
                <h2 className="mt-1 text-2xl font-black">{score ? "Update the score" : "Give the score"}</h2>
              </div>
              {score ? (
                <p className="text-right">
                  <span className="font-mono text-4xl font-black">
                    {entry.total}
                    <span className="text-sm text-muted">/{MAX_TOTAL}</span>
                  </span>
                  <span className="block text-xs text-muted">{position ? `Position #${position}` : ""}</span>
                </p>
              ) : null}
            </div>
            <div className="mt-5">
              <ScoreForm pitchId={pitch.id} existing={score} />
            </div>
          </section>

          <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_28px_85px_rgba(7,17,13,0.16)]">
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
              <Trophy className="size-3.5" aria-hidden /> Current ranking
            </p>
            {ranked.length === 0 ? (
              <p className="mt-3 text-sm text-white/70">Nothing scored yet. This pitch will be the first on the board.</p>
            ) : (
              <ol className="mt-3 divide-y divide-white/10">
                {ranked.slice(0, 5).map((item) => (
                  <li key={item.pitch.id} className={`flex items-center gap-3 py-2 ${item.pitch.id === pitch.id ? "text-brand" : ""}`}>
                    <span className="w-6 font-mono text-sm font-black text-white/50">{item.rank}</span>
                    <Avatar profile={item.profile} size="sm" className="size-8 border-white/80 text-xs" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.profile.name}</span>
                    <span className="font-mono text-sm font-black">{item.total}</span>
                  </li>
                ))}
                {position && position > 5 ? (
                  <li className="flex items-center gap-3 py-2 text-brand">
                    <span className="w-6 font-mono text-sm font-black text-white/50">{position}</span>
                    <Avatar profile={profile} size="sm" className="size-8 border-white/80 text-xs" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{profile.name}</span>
                    <span className="font-mono text-sm font-black">{entry.total}</span>
                  </li>
                ) : null}
              </ol>
            )}
            <Link href="/admin#ranking" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/70 transition hover:text-white">
              Full ranking <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
