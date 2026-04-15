import { ZodError } from "zod";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { adminPromptActivateRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";
import { activatePromptVersion } from "@/lib/content/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  try {
    const body = adminPromptActivateRequestSchema.parse(await request.json());
    const template = await activatePromptVersion(body.promptVersionId);
    return apiSuccess({ template });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "PROMPT_ACTIVATION_FAILED",
        message: error instanceof Error ? error.message : "Prompt activation failed",
      },
      400,
    );
  }
}
