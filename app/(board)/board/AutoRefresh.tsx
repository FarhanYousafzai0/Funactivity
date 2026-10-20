"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The only JavaScript the board needs: every few seconds it asks Next.js to re-run the
 * server page (router.refresh), so new scores appear without anyone touching the projector laptop.
 */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);
  return null;
}
