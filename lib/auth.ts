import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { issueToken, readToken, safeEqual, sign } from "./tokens";

export const PROFILE_COOKIE = "pa_profile";
export const ADMIN_COOKIE = "pa_admin";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function appSecret() {
  const secret = process.env.APP_SECRET;
  if (secret) return secret;
  if (process.env.VERCEL) throw new Error("APP_SECRET is not configured.");
  return "pitch-arena-dev-secret";
}

export function cookieOptions(maxAge = THIRTY_DAYS) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge };
}

// ---- Students: the browser that created a profile owns it. ----

export function profileToken(profileId: string) {
  return issueToken("profile", profileId, appSecret());
}

export async function currentProfileId() {
  const jar = await cookies();
  return readToken("profile", jar.get(PROFILE_COOKIE)?.value, appSecret());
}

// ---- Admin: one shared password from the environment. ----

export function adminPasswordValid(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password && safeEqual(input, password));
}

// The cookie is an HMAC of the password, so changing ADMIN_PASSWORD signs every admin out.
export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  return password ? sign(`admin:${password}`, appSecret()) : null;
}

export async function isAdmin() {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  const expected = adminToken();
  return Boolean(raw && expected && safeEqual(raw, expected));
}

export async function requireAdmin(nextPath: string) {
  if (!(await isAdmin())) redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
}
