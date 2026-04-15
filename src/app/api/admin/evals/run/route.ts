import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { evalSets } from "@/lib/content/catalog";
import { runEvalSet } from "@/lib/ai/harness";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { evalSetId?: string };
    const evalSet = evalSets.find((item) => item.id === body.evalSetId) || evalSets[0];
    const result = await runEvalSet(evalSet);
    return NextResponse.json({ evalSet: evalSet.name, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Eval execution failed",
      },
      { status: 400 },
    );
  }
}
