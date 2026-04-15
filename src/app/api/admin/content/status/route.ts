import { ZodError } from "zod";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { adminContentStatusRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";
import { updateLessonStatus } from "@/lib/content/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  try {
    const body = adminContentStatusRequestSchema.parse(await request.json());
    const lesson = await updateLessonStatus(body.lessonId, body.nextStatus);
    return apiSuccess({ lesson });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "LESSON_STATUS_UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Lesson status update failed",
      },
      400,
    );
  }
}
