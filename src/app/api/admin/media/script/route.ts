import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import { generateVideoScript, getPublishedLessonBySlug } from "@/lib/ai/harness";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { slug?: string };
    if (!body.slug) {
      throw new Error("Lesson slug is required");
    }

    const lesson = getPublishedLessonBySlug(body.slug);
    if (!lesson) {
      return NextResponse.json({ error: "Published lesson not found" }, { status: 404 });
    }

    const result = await generateVideoScript({
      title: lesson.title,
      summary: lesson.summary,
      focus: lesson.focus,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Video script generation failed",
      },
      { status: 400 },
    );
  }
}
