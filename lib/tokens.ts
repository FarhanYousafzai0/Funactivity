import { createHmac, timingSafeEqual } from "node:crypto";

// Pure signing helpers (no Next.js imports) so they can be unit tested.
// A cookie value is "<id>.<signature>"; the signature proves the server issued the id.

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function issueToken(scope: string, id: string, secret: string) {
  return `${id}.${sign(`${scope}:${id}`, secret)}`;
}

export function readToken(scope: string, raw: string | undefined | null, secret: string) {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const id = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  return safeEqual(signature, sign(`${scope}:${id}`, secret)) ? id : null;
}
