import { z } from "zod";

export const correctionRequestSchema = z.object({
  text: z.string().min(3),
  language: z.enum(["ko", "en"]).default("ko"),
  goal: z.string().min(2).default("자연스럽고 정확한 표현으로 교정"),
});

export const correctionResponseSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  summary: z.string(),
  notes: z.array(z.string()).min(1),
  alternatives: z.array(z.string()).min(1),
});

export const lessonDraftRequestSchema = z.object({
  topic: z.string().min(2),
  audience: z.enum(["both", "foreign_learner", "korean_english_learner"]),
  difficulty: z.number().min(1).max(3),
});

export const lessonDraftResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  objectives: z.array(z.string()),
  exampleSentences: z.array(z.string()),
  exercises: z.array(z.string()),
});

export const videoScriptRequestSchema = z.object({
  title: z.string(),
  summary: z.string(),
  focus: z.string(),
});

export const videoScriptResponseSchema = z.object({
  title: z.string(),
  hook: z.string(),
  narration: z.string(),
  scenes: z.array(
    z.object({
      heading: z.string(),
      visualPrompt: z.string(),
      captions: z.array(z.string()).min(1),
    }),
  ),
  youtube: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).min(1),
  }),
});
