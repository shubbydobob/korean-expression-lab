import { ZodError } from "zod";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { adminMediaScriptRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";
import { generateVideoScript } from "@/lib/ai/harness";
import { createMediaScriptRecord, getPublishedLessonBySlug } from "@/lib/content/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  try {
    const body = adminMediaScriptRequestSchema.parse(await request.json());

    const lesson = await getPublishedLessonBySlug(body.slug);
    if (!lesson) {
      return apiError({ code: "LESSON_NOT_FOUND", message: "Published lesson not found" }, 404);
    }

    const result = await generateVideoScript({
      title: lesson.title,
      summary: lesson.summary,
      focus: lesson.focus,
    });

    const mediaScript = await createMediaScriptRecord({
      contentId: lesson.id,
      contentSlug: lesson.slug,
      title: result.title,
      narration: result.narration,
      scenePlan: result.scenes,
      youtubeMetadata: result.youtube,
    });

    return apiSuccess({ mediaScript, result });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "VIDEO_SCRIPT_GENERATION_FAILED",
        message: error instanceof Error ? error.message : "Video script generation failed",
      },
      400,
    );
  }
}
