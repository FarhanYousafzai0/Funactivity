import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md rounded-3xl border border-line bg-white/85 p-8 text-center">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep">404</p>
      <h1 className="mt-2 text-2xl font-black">Nothing here</h1>
      <p className="mt-2 text-sm text-muted">That profile or pitch does not exist, or the judges hid it.</p>
      <Link href="/" className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 font-bold text-white">
        Back to the arena
      </Link>
    </section>
  );
}
