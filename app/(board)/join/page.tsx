import type { Metadata } from "next";
import { ArrowLeft, Download, Radio, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = { title: "Join · Pitch Arena" };
export const dynamic = "force-dynamic";

const steps = [
  "Scan the code or type the address.",
  "Create your profile: name, studies, what you want to become, and your AI-made photo.",
  "Pitch us one idea that solves a real problem. The judges score it live.",
];

// Projector page: a QR code big enough to scan from the back of the room.
export default async function JoinPage() {
  const url = await siteUrl();
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#06110d", light: "#ffffff" } });
  const pretty = url.replace(/^https?:\/\//, "");

  return (
    <div className="relative z-[1] mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="Back to the Pitch Arena home page" className="inline-flex transition hover:-translate-y-0.5 hover:opacity-90">
          <Image src="/ai-skool-logo-compact.svg" alt="AI SKOOL" width={190} height={38} priority className="h-8 w-auto sm:h-10" />
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/board" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft">
            <Radio className="size-4 text-brand" aria-hidden /> Live board
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-muted underline-offset-4 transition hover:text-ink hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> Exit
          </Link>
        </div>
      </header>

      <main className="rise grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-brand-deep">NextGen AI Bootcamp · Fun activity</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight sm:text-7xl">Join the Pitch Arena</h1>
          <p className="mt-4 inline-flex items-center gap-2 text-xl text-muted sm:text-2xl">
            <Smartphone className="size-6 text-brand-deep" aria-hidden /> Open on your phone:
          </p>
          <p className="mt-2 break-all font-mono text-3xl font-black tracking-tight text-ink sm:text-5xl">{pretty}</p>
          <ol className="mt-8 space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-4 text-lg leading-8 sm:text-2xl sm:leading-9">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-brand font-mono text-base font-black text-ink">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href="/qr.png"
            download="pitch-arena-qr.png"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold transition hover:-translate-y-0.5 hover:border-brand-deep"
          >
            <Download className="size-4" aria-hidden /> Download the QR as PNG for WhatsApp
          </a>
        </div>

        <div className="lift mx-auto rounded-[32px] border border-line bg-white p-6 shadow-[0_28px_80px_rgba(0,182,108,0.18)]">
          {/* SVG from the qrcode package: our own data, no user input, safe to inline. */}
          <div className="size-[min(70vw,460px)] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-4 text-center font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Scan to join</p>
        </div>
      </main>
    </div>
  );
}
