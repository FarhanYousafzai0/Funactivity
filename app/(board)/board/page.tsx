import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { leaderboard, stats } from "@/db/queries";
import { firstName, formatTime } from "@/lib/format";
import { MAX_TOTAL } from "@/lib/scoring";
import { AutoRefresh } from "./AutoRefresh";

export const metadata: Metadata = { title: "Live board" };
export const dynamic = "force-dynamic";

const medal = ["bg-gold text-ink", "bg-silver text-ink", "bg-bronze text-ink"];

export default async function BoardPage() {
  const [entries, counts] = await Promise.all([leaderboard(), stats()]);
  const scored = entries.filter((entry) => entry.rank !== null);
  const waiting = entries.filter((entry) => entry.rank === null);
  const podium = scored.slice(0, 3);
  const rest = scored.slice(3);
  const renderedAt = new Date().toISOString();

  return (
    // Rendered inside the bare (board) layout: no site header, dark page, built for a projector.
    <div className="min-h-svh text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">
        <AutoRefresh seconds={10} />

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand">AI SKOOL · NextGen AI Bootcamp</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Pitch Arena · Live board</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
              <span className="live-dot" /> Live · {formatTime(renderedAt)}
            </span>
            <Link href="/" className="underline-offset-4 hover:underline">
              Exit
            </Link>
          </div>
        </header>

        <div className="mt-8">
          {scored.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/20 p-12 text-center">
              <p className="text-2xl font-black">No scores yet</p>
              <p className="mt-2 text-white/60">
                {counts.pitches === 0 ? "Waiting for the first pitch." : `${counts.pitches} pitch${counts.pitches === 1 ? "" : "es"} in, the judges are deciding.`}
              </p>
            </div>
          ) : (
            <>
              <ol className="grid gap-4 sm:grid-cols-3">
                {podium.map((entry, index) => (
                  <li
                    key={entry.pitch.id}
                    className={`relative rounded-3xl border border-white/10 bg-white/5 p-6 text-center ${index === 0 ? "sm:order-2 sm:-translate-y-3 sm:border-brand/40 sm:bg-brand/10" : index === 1 ? "sm:order-1" : "sm:order-3"}`}
                  >
                    <span className={`absolute left-5 top-5 inline-flex size-9 items-center justify-center rounded-full font-black ${medal[index]}`}>{entry.rank}</span>
                    <Avatar profile={entry.profile} size={index === 0 ? "xl" : "lg"} className="mx-auto border-white/20" />
                    <p className="mt-4 text-xl font-black">{entry.profile.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-white/70">{entry.pitch.title}</p>
                    <p className="mt-3 text-4xl font-black text-brand">
                      {entry.total}
                      <span className="text-base text-white/40">/{MAX_TOTAL}</span>
                    </p>
                  </li>
                ))}
              </ol>

              {rest.length > 0 ? (
                <ol className="mt-6 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/5">
                  {rest.map((entry) => (
                    <li key={entry.pitch.id} className="flex items-center gap-4 px-5 py-3">
                      <span className="w-8 font-mono text-lg font-black text-white/50">{entry.rank}</span>
                      <Avatar profile={entry.profile} size="sm" className="border-white/20" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{entry.profile.name}</p>
                        <p className="truncate text-sm text-white/60">{entry.pitch.title}</p>
                      </div>
                      <span className="text-2xl font-black text-brand">{entry.total}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          )}
        </div>

        {waiting.length > 0 ? (
          <section className="mt-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Waiting for the judges · {waiting.length}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {waiting.map((entry) => (
                <li key={entry.pitch.id} className="inline-flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-4 text-sm">
                  <Avatar profile={entry.profile} size="sm" className="size-8 border-white/20 text-xs" />
                  <span className="font-semibold">{firstName(entry.profile.name)}</span>
                  <span className="text-white/50">· {entry.pitch.title}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="mt-10 flex flex-wrap gap-6 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
          <span>{counts.profiles} profiles</span>
          <span>{counts.pitches} pitches</span>
          <span>{counts.scored} scored</span>
        </footer>
      </div>
    </div>
  );
}
