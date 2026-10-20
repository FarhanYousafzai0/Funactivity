import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Arena" },
  { href: "/board", label: "Live board" },
  { href: "/learn", label: "How it works" },
];

export function SiteHeader() {
  return (
    <header className="relative z-[2] mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6">
      <Link href="/" className="flex items-center gap-3" aria-label="Pitch Arena home">
        <Image src="/ai-skool-logo-compact.svg" alt="AI SKOOL" width={150} height={30} priority className="h-7 w-auto sm:h-8" />
        <span className="hidden rounded-full border border-line bg-white/70 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-brand-deep sm:inline-flex">
          Pitch Arena
        </span>
      </Link>

      <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-full px-3 py-1.5 text-ink/80 transition hover:bg-white/80 hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
