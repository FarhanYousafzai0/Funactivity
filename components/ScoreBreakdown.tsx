import { RUBRIC, SCORE_MAX, type ScoreInput } from "@/lib/scoring";

/** Four small bars, one per rubric criterion. */
export function ScoreBreakdown({ score, dark = false, className = "" }: { score: ScoreInput; dark?: boolean; className?: string }) {
  return (
    <ul className={`grid gap-2 sm:grid-cols-2 ${className}`}>
      {RUBRIC.map((item) => (
        <li key={item.key} className="text-sm">
          <div className="flex items-center justify-between">
            <span className={dark ? "text-white/80" : "text-ink/80"}>{item.label}</span>
            <span className="font-mono font-bold">
              {score[item.key]}/{SCORE_MAX}
            </span>
          </div>
          <div className={`mt-1 h-2 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-line"}`}>
            <div className="h-full rounded-full bg-brand" style={{ width: `${(score[item.key] / SCORE_MAX) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
