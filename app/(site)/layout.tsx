import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Pitch Arena · AI SKOOL", template: "%s · Pitch Arena" },
  description: "Create your profile, pitch a business idea that solves a real problem, and watch the judges' board live. The NextGen AI Bootcamp fun activity.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-svh flex-col">
        <div className="page-grid" aria-hidden />
        <SiteHeader />
        <main className="relative z-[1] mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <footer className="relative z-[1] mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pb-6 text-xs text-muted sm:px-6">
          <span>
            AI SKOOL × MetaKlouds · NextGen AI Bootcamp · {process.env.NEXT_PUBLIC_APP_VERSION} ({process.env.NEXT_PUBLIC_APP_COMMIT})
          </span>
          <Link href="/admin" className="underline-offset-4 hover:text-ink hover:underline">
            Judges
          </Link>
        </footer>
      </body>
    </html>
  );
}
