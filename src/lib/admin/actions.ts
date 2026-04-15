"use server";

import { redirect } from "next/navigation";

import { validateAdminCredentials } from "@/lib/auth/credentials";
import { createAdminSession, destroyAdminSession, requireAdmin } from "@/lib/auth/session";
import { activatePromptVersion, updateLessonStatus } from "@/lib/content/repository";
import type { ContentStatus } from "@/lib/types";

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

export async function changeLessonStatus(formData: FormData) {
  await requireAdmin();

  const lessonId = String(formData.get("lessonId") || "");
  const nextStatus = String(formData.get("nextStatus") || "") as ContentStatus;

  if (!lessonId || !nextStatus) {
    throw new Error("Lesson status payload is incomplete");
  }

  await updateLessonStatus(lessonId, nextStatus);
  redirect("/admin");
}

export async function activatePromptVersionAction(formData: FormData) {
  await requireAdmin();

  const promptVersionId = String(formData.get("promptVersionId") || "");
  if (!promptVersionId) {
    throw new Error("Prompt version id is required");
  }

  await activatePromptVersion(promptVersionId);
  redirect("/admin");
}
