import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { generateLessonDraft } from "@/lib/ai/harness";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const result = await generateLessonDraft(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Draft generation failed",
      },
      { status: 400 },
    );
  }
}
