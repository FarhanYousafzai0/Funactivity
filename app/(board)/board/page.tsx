import type { Metadata } from "next";
import { ArrowLeft, Crown, Hourglass, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { leaderboard, stats, type RankedEntry } from "@/db/queries";
import { formatTime } from "@/lib/format";
import { MAX_TOTAL, RUBRIC } from "@/lib/scoring";
import { AutoRefresh } from "./AutoRefresh";

export const metadata: Metadata = { title: "Live board" };
export const dynamic = "force-dynamic";

// Same podium language as the AI SKOOL leaderboard: light cards, the leader in ink, gold/silver/bronze medals.
const medal = ["bg-gold text-ink", "bg-silver text-ink", "bg-bronze text-white"];

function Breakdown({ entry, dark = false }: { entry: RankedEntry; dark?: boolean }) {
  if (!entry.score) return null;
  return (
    <ul className={`mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 font-mono text-[11px] ${dark ? "text-white/60" : "text-muted"}`}>
      {RUBRIC.map((item) => (
        <li key={item.key}>
          {item.label} <strong className={dark ? "text-brand" : "text-ink"}>{entry.score![item.key]}</strong>
        </li>
      ))}
    </ul>
  );
}

export default async function BoardPage() {
  const [entries, counts] = await Promise.all([leaderboard(), stats()]);
  const scored = entries.filter((entry) => entry.rank !== null);
  const waiting = entries.filter((entry) => entry.rank === null);
  const podium = scored.slice(0, 3);
  const rest = scored.slice(3);
  const renderedAt = new Date().toISOString();

  return (
    <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
      <AutoRefresh seconds={10} />

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <Image src="/ai-skool-logo-compact.svg" alt="AI SKOOL" width={190} height={38} priority className="h-8 w-auto sm:h-10" />
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-deep">NextGen AI Bootcamp · Pitch Arena</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Live board</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="live-dot" /> Live · {formatTime(renderedAt)}
          </span>
          <Link href="/" className="inline-flex items-center gap-1 underline-offset-4 transition hover:text-ink hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> Exit
          </Link>
        </div>
      </header>

      {scored.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center">
          <p className="text-2xl font-black">No scores yet</p>
          <p className="mt-2 text-muted">
            {counts.pitches === 0 ? "Waiting for the first pitch." : `${counts.pitches} pitch${counts.pitches === 1 ? "" : "es"} in, the judges are deciding.`}
          </p>
        </div>
      ) : (
        <>
          {/* Podium: #1 in the middle, taller and in ink, like the leaderboard winner card. */}
          <ol className="rise mt-10 grid gap-4 sm:grid-cols-3 sm:items-end">
            {podium.map((entry, index) => {
              const winner = index === 0;
              return (
                <li
                  key={entry.pitch.id}
                  className={`lift relative overflow-hidden rounded-3xl border p-6 text-center shadow-[0_20px_55px_rgba(14,50,33,0.07)] ${
                    winner
                      ? "border-brand-deep/45 bg-ink text-white shadow-[0_28px_80px_rgba(0,182,108,0.2)] sm:order-2 sm:min-h-[340px]"
                      : `border-line bg-white/85 ${index === 1 ? "sm:order-1" : "sm:order-3"}`
                  }`}
                >
                  {winner ? <span aria-hidden className="pointer-events-none absolute -bottom-[55%] -left-[15%] -right-[15%] h-[75%] rounded-full bg-brand/15" /> : null}
                  <span className={`absolute left-4 top-4 inline-flex size-9 items-center justify-center rounded-full font-mono font-black ${medal[index]}`}>{entry.rank}</span>
                  <Avatar profile={entry.profile} size={winner ? "xl" : "lg"} className="relative mx-auto" />
                  <p className={`relative mt-3 font-mono text-[9px] font-black uppercase tracking-[0.17em] ${winner ? "text-gold" : "text-brand-deep"}`}>
                    {entry.rank === 1 ? <span className="inline-flex items-center gap-1"><Crown className="size-3.5" aria-hidden /> Leading</span> : `Place ${entry.rank}`}
                  </p>
                  <h2 className="relative mt-1 text-2xl font-black tracking-tight">{entry.profile.name}</h2>
                  {entry.profile.tagline ? <p className={`relative text-xs ${winner ? "text-white/60" : "text-muted"}`}>{entry.profile.tagline}</p> : null}
                  <p className={`relative mt-3 text-base font-bold leading-6 ${winner ? "text-brand" : "text-ink"}`}>{entry.pitch.title}</p>
                  <p className={`relative mt-1 text-sm leading-6 ${winner ? "text-white/70" : "text-muted"}`}>{entry.pitch.problem}</p>
                  <p className="relative mt-4 font-mono text-4xl font-black tracking-tight">
                    {entry.total}
                    <span className={`ml-1 text-sm ${winner ? "text-white/50" : "text-muted"}`}>/{MAX_TOTAL}</span>
                  </p>
                  <div className={`relative mx-auto mt-3 h-1.5 w-4/5 overflow-hidden rounded-full ${winner ? "bg-white/15" : "bg-ink/10"}`}>
                    <span className={`block h-full rounded-full ${winner ? "bg-gold" : "bg-brand-deep"}`} style={{ width: `${(entry.total! / MAX_TOTAL) * 100}%` }} />
                  </div>
                  <Breakdown entry={entry} dark={winner} />
                </li>
              );
            })}
          </ol>

          {/* Everyone else: the dark ranking block from the leaderboard. */}
          {rest.length > 0 ? (
            <section className="rise rise-2 mt-8 rounded-[28px] bg-ink p-5 text-white shadow-[0_28px_85px_rgba(7,17,13,0.16)] sm:p-8">
              <h2 className="inline-flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl"><Trophy className="size-6 text-brand" aria-hidden /> Full ranking</h2>
              <ol className="mt-4 divide-y divide-white/10">
                {rest.map((entry) => (
                  <li key={entry.pitch.id} className="flex items-start gap-4 py-4">
                    <span className="w-8 shrink-0 pt-1 font-mono text-xl font-black text-white/40">{entry.rank}</span>
                    <Avatar profile={entry.profile} size="md" className="border-white/90" />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black">{entry.profile.name}</p>
                      <p className="font-semibold text-brand">{entry.pitch.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/70">{entry.pitch.problem}</p>
                      <div className="[&>ul]:justify-start">
                        <Breakdown entry={entry} dark />
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-3xl font-black text-brand">
                      {entry.total}
                      <span className="ml-1 text-xs text-white/40">/{MAX_TOTAL}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      )}

      {waiting.length > 0 ? (
        <section className="mt-8">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted"><Hourglass className="size-3.5" aria-hidden /> Waiting for the judges · {waiting.length}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {waiting.map((entry) => (
              <li key={entry.pitch.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1 pl-1 pr-4 text-sm">
                <Avatar profile={entry.profile} size="sm" className="size-8 text-xs" />
                <span className="font-semibold">{entry.profile.name}</span>
                <span className="text-muted">· {entry.pitch.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        <span>{counts.profiles} profiles</span>
        <span>{counts.pitches} pitches</span>
        <span>{counts.scored} scored</span>
      </footer>
    </div>
  );
}
