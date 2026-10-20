"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

/** Copies text to the clipboard. Clipboard access only exists in the browser, so this is a client component. */
export function CopyButton({ text, label = "Copy prompt", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Older browsers: select-and-copy fallback.
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      setCopied(true);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${
        copied ? "bg-brand text-ink" : "bg-ink text-white hover:bg-ink-soft"
      } ${className}`}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? "Copied!" : label}
    </button>
  );
}
