import { z } from "zod";
import type { PromptTask } from "@/lib/types";

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

type JsonSchema = Record<string, unknown>;

function strictObject(properties: Record<string, JsonSchema>, required: string[]): JsonSchema {
  return {
    type: "object",
    additionalProperties: false,
    properties,
    required,
  };
}

export const responseFormatByTask: Record<
  Extract<PromptTask, "correction" | "lesson_generation" | "video_script_generation">,
  { name: string; schema: JsonSchema }
> = {
  correction: {
    name: "correction_result",
    schema: strictObject(
      {
        original: { type: "string" },
        corrected: { type: "string" },
        summary: { type: "string" },
        notes: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        alternatives: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      ["original", "corrected", "summary", "notes", "alternatives"],
    ),
  },
  lesson_generation: {
    name: "lesson_draft",
    schema: strictObject(
      {
        title: { type: "string" },
        summary: { type: "string" },
        objectives: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
        },
        exampleSentences: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
        },
        exercises: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
        },
      },
      ["title", "summary", "objectives", "exampleSentences", "exercises"],
    ),
  },
  video_script_generation: {
    name: "video_script",
    schema: strictObject(
      {
        title: { type: "string" },
        hook: { type: "string" },
        narration: { type: "string" },
        scenes: {
          type: "array",
          minItems: 3,
          items: strictObject(
            {
              heading: { type: "string" },
              visualPrompt: { type: "string" },
              captions: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
              },
            },
            ["heading", "visualPrompt", "captions"],
          ),
        },
        youtube: strictObject(
          {
            title: { type: "string" },
            description: { type: "string" },
            tags: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
            },
          },
          ["title", "description", "tags"],
        ),
      },
      ["title", "hook", "narration", "scenes", "youtube"],
    ),
  },
};
