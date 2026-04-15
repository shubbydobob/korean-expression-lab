import { ZodError } from "zod";

import { runCorrection } from "@/lib/ai/harness";
import { correctionApiRequestSchema } from "@/lib/api/contracts";
import { apiError, apiSuccess, zodErrorToApi } from "@/lib/api/responses";

export async function POST(request: Request) {
  try {
    const payload = correctionApiRequestSchema.parse(await request.json());
    const result = await runCorrection(payload);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorToApi(error);
    }

    return apiError(
      {
        code: "CORRECTION_FAILED",
        message: error instanceof Error ? error.message : "Correction failed",
      },
      400,
    );
  }
}
