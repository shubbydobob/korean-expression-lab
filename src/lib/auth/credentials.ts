import { getRequiredEnv } from "@/lib/env";

export function validateAdminCredentials(email: string, password: string) {
  const env = getRequiredEnv();
  return email === env.adminEmail && password === env.adminPassword;
}
