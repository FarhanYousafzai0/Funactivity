"use client";

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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft ${className}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
