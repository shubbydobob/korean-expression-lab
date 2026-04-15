import { getAiEnv } from "@/lib/env";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export async function callOpenAiJson(messages: ChatMessage[]) {
  const { apiKey, baseUrl, model } = getAiEnv();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? null;
}
