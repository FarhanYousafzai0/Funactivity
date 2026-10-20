import { BookOpen, LayoutGrid, ShieldCheck, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Arena", Icon: LayoutGrid },
  { href: "/board", label: "Live board", Icon: Trophy },
  { href: "/learn", label: "How it works", Icon: BookOpen },
];

export function SiteHeader() {
  return (
    <header className="relative z-[2] mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6">
      <Link href="/" className="flex items-center gap-3 transition hover:opacity-90" aria-label="Pitch Arena home">
        <Image src="/ai-skool-logo-compact.svg" alt="AI SKOOL" width={150} height={30} priority className="h-7 w-auto sm:h-8" />
        <span className="hidden rounded-full border border-line bg-white/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep sm:inline-flex">
          Pitch Arena
        </span>
      </Link>

      <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink/80 transition hover:-translate-y-0.5 hover:bg-white/80 hover:text-ink active:translate-y-0"
          >
            <Icon className="size-4 text-brand-deep" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        <Link
          href="/admin"
          className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 font-mono text-[11px] font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-ink-soft active:translate-y-0 active:scale-[0.97]"
        >
          <ShieldCheck className="size-4 text-brand" aria-hidden /> Judges
        </Link>
      </nav>
    </header>
  );
}
