import type { ReactNode } from "react";

/**
 * Marks a part of the page as server-rendered or browser-run for teach mode.
 * It renders a plain <div>; the dashed outline and label only appear while
 * <html data-teach="on"> (see globals.css), so it works inside both server and client trees.
 */
export function Boundary({
  kind,
  label,
  children,
  className,
}: {
  kind: "server" | "client";
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-boundary={kind} data-label={`${kind === "server" ? "Server" : "Client"} · ${label}`} className={className}>
      {children}
    </div>
  );
}
