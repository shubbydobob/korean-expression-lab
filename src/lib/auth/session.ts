import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getRequiredEnv } from "@/lib/env";

const ADMIN_COOKIE = "korean-admin-session";

function sign(value: string) {
  const { sessionSecret } = getRequiredEnv();
  return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

function createToken(email: string) {
  const payload = `${email}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string) {
  const parts = token.split(".");
  if (parts.length < 3) {
    return false;
  }

  const signature = parts.at(-1)!;
  const payload = parts.slice(0, -1).join(".");
  const expected = sign(payload);

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function createAdminSession(email: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, createToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return token ? verifyToken(token) : false;
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    redirect("/admin/login");
  }
}
