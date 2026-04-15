import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status },
  );
}

export function apiError(error: ApiError, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error,
    },
    { status },
  );
}

export function zodErrorToApi(error: ZodError) {
  return apiError(
    {
      code: "INVALID_INPUT",
      message: "Request payload validation failed",
      details: error.flatten(),
    },
    400,
  );
}
