import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const linkClass =
  "inline-flex h-9 items-center gap-1 rounded-full border border-line bg-white px-3 text-xs font-bold text-ink transition hover:-translate-y-0.5 hover:border-brand-deep active:translate-y-0 active:scale-[0.97]";
const disabledClass = "inline-flex h-9 items-center gap-1 rounded-full border border-line bg-white/50 px-3 text-xs font-bold text-muted/60";

/** Prev / next links driven by a query parameter, so it works without JavaScript and keeps other params. */
export function Pagination({
  page,
  pageCount,
  total,
  hrefFor,
  label = "items",
}: {
  page: number;
  pageCount: number;
  total: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3 text-xs text-muted" aria-label="Pagination">
      <span>
        Page <strong className="text-ink">{page}</strong> of {pageCount} · {total} {label}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClass} scroll={false}>
            <ChevronLeft className="size-3.5" aria-hidden /> Previous
          </Link>
        ) : (
          <span className={disabledClass}>
            <ChevronLeft className="size-3.5" aria-hidden /> Previous
          </span>
        )}
        {page < pageCount ? (
          <Link href={hrefFor(page + 1)} className={linkClass} scroll={false}>
            Next <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        ) : (
          <span className={disabledClass}>
            Next <ChevronRight className="size-3.5" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
