import { ZodError } from "zod";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { generateLessonDraft } from "@/lib/ai/harness";
import { adminGenerateDraftRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";
import { createLessonDraftRecord } from "@/lib/content/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  try {
    const payload = adminGenerateDraftRequestSchema.parse(await request.json());
    const result = await generateLessonDraft(payload);
    const draft = await createLessonDraftRecord({
      topic: payload.topic,
      audience: payload.audience,
      difficulty: payload.difficulty,
      title: result.title,
      summary: result.summary,
      objectives: result.objectives,
      exercises: result.exercises,
    });
    return apiSuccess({ draft, result }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "DRAFT_GENERATION_FAILED",
        message: error instanceof Error ? error.message : "Draft generation failed",
      },
      400,
    );
  }
}
