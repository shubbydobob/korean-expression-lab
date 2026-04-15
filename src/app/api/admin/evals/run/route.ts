import { ZodError } from "zod";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { runEvalSet } from "@/lib/ai/harness";
import { adminEvalRunRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";
import {
  attachEvalRunToPromptVersion,
  createEvalRun,
  getActivePromptVersionByTask,
  getEvalSetById,
  getPromptVersionById,
} from "@/lib/content/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return apiError({ code: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  try {
    const body = adminEvalRunRequestSchema.parse(await request.json());
    const evalSet = await getEvalSetById(body.evalSetId);
    if (!evalSet) {
      return apiError({ code: "EVAL_SET_NOT_FOUND", message: "Eval set not found" }, 404);
    }

    const promptTarget = body.promptVersionId
      ? await getPromptVersionById(body.promptVersionId)
      : await getActivePromptVersionByTask(evalSet.task);

    if (!promptTarget) {
      return apiError({ code: "PROMPT_VERSION_NOT_FOUND", message: "Prompt version not found" }, 404);
    }

    if (promptTarget.template.task !== evalSet.task) {
      return apiError(
        {
          code: "PROMPT_EVAL_TASK_MISMATCH",
          message: "Prompt version task does not match eval set task",
        },
        400,
      );
    }

    const result = await runEvalSet(evalSet, { promptVersionId: promptTarget.version.id });
    const evalRun = await createEvalRun({
      evalSetId: evalSet.id,
      evalSetName: evalSet.name,
      task: evalSet.task,
      promptVersionId: promptTarget.version.id,
      promptVersion: promptTarget.version.version,
      score: result.score,
      thresholdPassed: result.thresholdPassed,
      results: result.results,
    });
    await attachEvalRunToPromptVersion({
      promptVersionId: promptTarget.version.id,
      evalRunId: evalRun.id,
      score: result.score,
      thresholdPassed: result.thresholdPassed,
    });
    return apiSuccess({ evalSet: evalSet.name, ...result, evalRun });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "EVAL_EXECUTION_FAILED",
        message: error instanceof Error ? error.message : "Eval execution failed",
      },
      400,
    );
  }
}
