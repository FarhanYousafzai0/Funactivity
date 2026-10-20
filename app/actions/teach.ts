"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { cookieOptions, TEACH_COOKIE } from "@/lib/auth";

/** Flips the teach-mode cookie. The layout reads it and sets <html data-teach>, which turns the outlines on. */
export async function toggleTeachMode() {
  const jar = await cookies();
  const on = jar.get(TEACH_COOKIE)?.value === "on";
  jar.set(TEACH_COOKIE, on ? "off" : "on", { ...cookieOptions(), httpOnly: false });
  revalidatePath("/", "layout");
}
