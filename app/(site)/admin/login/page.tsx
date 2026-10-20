import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = { title: "Judges sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await isAdmin()) redirect("/admin");

  return (
    <section className="rise mx-auto max-w-sm rounded-3xl border border-line bg-white/85 p-6 shadow-[0_24px_60px_rgba(7,17,13,0.08)] backdrop-blur">
      <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-deep"><ShieldCheck className="size-4" aria-hidden /> Judges only</p>
      <h1 className="mt-1 text-2xl font-black">Sign in to score pitches</h1>
      <p className="mt-1 text-sm text-muted">Enter the judges&apos; password to open the scoring desk.</p>
      <div className="mt-5">
        <AdminLoginForm next={next ?? "/admin"} />
      </div>
    </section>
  );
}
