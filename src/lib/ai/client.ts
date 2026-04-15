import { getAiEnv } from "@/lib/env";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type StructuredOutputConfig = {
  name: string;
  schema: Record<string, unknown>;
};

export async function callOpenAiJson(input: {
  model: string;
  messages: ChatMessage[];
  output: StructuredOutputConfig;
}) {
  const { apiKey, baseUrl } = getAiEnv();

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
      model: input.model,
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: input.output.name,
          strict: true,
          schema: input.output.schema,
        },
      },
      messages: input.messages,
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
