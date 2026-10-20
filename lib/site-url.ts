import { headers } from "next/headers";

/**
 * The public address students should open. Set NEXT_PUBLIC_SITE_URL to pin it (a custom domain,
 * for example); otherwise Vercel's production hostname is used, and locally the request's own host.
 */
export async function siteUrl() {
  const pinned = process.env.NEXT_PUBLIC_SITE_URL;
  if (pinned) return pinned.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3002";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
