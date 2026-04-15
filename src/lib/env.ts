const REQUIRED_ENV_KEYS = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "SESSION_SECRET"] as const;

export function getRequiredEnv() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment keys: ${missing.join(", ")}`);
  }

  return {
    adminEmail: process.env.ADMIN_EMAIL!,
    adminPassword: process.env.ADMIN_PASSWORD!,
    sessionSecret: process.env.SESSION_SECRET!,
  };
}

export function getAiEnv() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  };
}
