import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Boundary } from "@/components/Boundary";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { getPitch } from "@/db/queries";
import { currentProfileId, isAdmin } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";
import { isValidId } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = isValidId(id) ? await getPitch(id) : null;
  return { title: entry ? `${entry.pitch.title} by ${entry.profile.name}` : "Pitch" };
}

export default async function PitchPage({ params, searchParams }: Props) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  if (!isValidId(id)) notFound();

  const [entry, viewerId, admin] = await Promise.all([getPitch(id), currentProfileId(), isAdmin()]);
  if (!entry || (entry.profile.hidden && !admin)) notFound();

  const owner = viewerId === entry.profile.id;
  const { pitch, profile, score } = entry;

  return (
    <Boundary kind="server" label="pitch page: one database query, rendered to HTML">
      <article className="mx-auto max-w-2xl">
        {saved && owner ? (
          <p className="mb-4 rounded-2xl border border-brand-deep/30 bg-brand/15 px-4 py-3 text-center text-sm font-semibold">
            Your pitch is saved. The judges can see it now. Good luck!
          </p>
        ) : null}

        <header className="flex items-center gap-4">
          <Link href={`/profile/${profile.id}`}>
            <Avatar profile={profile} size="lg" />
          </Link>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">Pitch by {profile.name}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{pitch.title}</h1>
            <p className="mt-1 text-xs text-muted">
              {profile.tagline ? `${profile.tagline} · ` : ""}submitted {formatTime(pitch.createdAt)}
              {pitch.updatedAt !== pitch.createdAt ? `, edited ${formatTime(pitch.updatedAt)}` : ""}
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4">
          {[
            ["The problem", pitch.problem],
            ["Who has it", pitch.audience],
            ["How AI solves it", pitch.solution],
          ].map(([label, text]) => (
            <section key={label} className="rounded-3xl border border-line bg-white/85 p-5 backdrop-blur sm:p-6">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep">{label}</h2>
              <p className="mt-2 whitespace-pre-line text-base leading-7">{text}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-line bg-ink p-6 text-white">
          {score ? (
            <>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">Judges&apos; score</p>
                  <p className="mt-1 text-5xl font-black">
                    {entry.total}
                    <span className="text-xl text-white/50">/{MAX_TOTAL}</span>
                  </p>
                </div>
                <p className="text-xs text-white/60">Scored at {formatTime(score.scoredAt)}</p>
              </div>
              <ScoreBreakdown score={score} dark className="mt-5" />
              {score.note && (owner || admin) ? (
                <p className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6">
                  <span className="font-bold text-brand">Note from the judges:</span> {score.note}
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand">Judges&apos; score</p>
                <p className="mt-1 text-lg font-bold">Waiting for the judges…</p>
              </div>
              {owner ? (
                <Link href="/pitch/new" className="inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-bold hover:bg-white/10">
                  Edit my pitch
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/board" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-bold text-ink">
            Live board
          </Link>
          <Link href="/" className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold">
            Back to the arena
          </Link>
        </div>
      </article>
    </Boundary>
  );
}
