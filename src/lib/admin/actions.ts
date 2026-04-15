"use server";

import { redirect } from "next/navigation";

import { validateAdminCredentials } from "@/lib/auth/credentials";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";

export async function loginAdmin(_: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!validateAdminCredentials(email, password)) {
    return { error: "관리자 계정 정보가 올바르지 않습니다." };
  }

  await createAdminSession(email);
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}
