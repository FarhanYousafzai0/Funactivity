import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { isTeachMode } from "@/lib/auth";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live board · Pitch Arena",
  description: "The judges' live ranking for the Pitch Arena.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: false, follow: false },
};

// A second root layout just for the projector board: no header, no footer, dark background.
export default async function BoardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const teach = await isTeachMode();
  return (
    <html lang="en" data-teach={teach ? "on" : "off"} className={`${geistSans.variable} ${geistMono.variable} bg-ink`}>
      <body className="min-h-svh bg-ink text-white">{children}</body>
    </html>
  );
}
