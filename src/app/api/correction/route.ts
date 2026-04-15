import { NextResponse } from "next/server";

import { runCorrection } from "@/lib/ai/harness";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await runCorrection(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Correction failed",
      },
      { status: 400 },
    );
  }
}
