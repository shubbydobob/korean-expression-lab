import { z } from "zod";

import { correctionRequestSchema, lessonDraftRequestSchema } from "@/lib/ai/schemas";

export const correctionApiRequestSchema = correctionRequestSchema;

export const adminGenerateDraftRequestSchema = lessonDraftRequestSchema;

export const adminEvalRunRequestSchema = z.object({
  evalSetId: z.string().optional(),
  promptVersionId: z.string().optional(),
});

export const adminMediaScriptRequestSchema = z.object({
  slug: z.string().min(1, "Lesson slug is required"),
});

export const adminContentStatusRequestSchema = z.object({
  lessonId: z.string().min(1, "Lesson id is required"),
  nextStatus: z.enum(["draft", "reviewed", "published", "archived"]),
});

export const adminPromptActivateRequestSchema = z.object({
  promptVersionId: z.string().min(1, "Prompt version id is required"),
});
