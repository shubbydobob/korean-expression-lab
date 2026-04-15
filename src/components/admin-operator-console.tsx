"use client";

import { useState, useTransition } from "react";

import type { EvalSet, LessonCard, MediaScriptRecord, PromptVersion } from "@/lib/types";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string } };

type DraftResponse = {
  draft: LessonCard;
  result: {
    title: string;
    summary: string;
    objectives: string[];
    exampleSentences: string[];
    exercises: string[];
  };
};

type EvalResponse = {
  evalSet: string;
  score: number;
  thresholdPassed: boolean;
  results: Array<{ id: string; passed: boolean; summary: string }>;
  evalRun: { promptVersion: number; id: string };
};

type MediaResponse = {
  mediaScript: MediaScriptRecord;
  result: {
    title: string;
    hook: string;
    narration: string;
    scenes: Array<{ heading: string; visualPrompt: string; captions: string[] }>;
    youtube: { title: string; description: string; tags: string[] };
  };
};

export function AdminOperatorConsole({
  evalSets,
  promptVersions,
  publishedLessons,
}: {
  evalSets: EvalSet[];
  promptVersions: PromptVersion[];
  publishedLessons: LessonCard[];
}) {
  const [draftResult, setDraftResult] = useState<DraftResponse | null>(null);
  const [evalResult, setEvalResult] = useState<EvalResponse | null>(null);
  const [mediaResult, setMediaResult] = useState<MediaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runTask(task: () => Promise<void>) {
    startTransition(async () => {
      setError(null);
      await task().catch((nextError) => {
        setError(nextError instanceof Error ? nextError.message : "Admin operation failed");
      });
    });
  }

  async function parseResponse<T>(response: Response): Promise<T> {
    const payload = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.ok ? "Admin operation failed" : payload.error.message);
    }
    return payload.data;
  }

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Draft Generator</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            runTask(async () => {
              const data = await parseResponse<DraftResponse>(
                await fetch("/api/admin/generate-draft", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    topic: String(formData.get("topic") || ""),
                    audience: String(formData.get("audience") || ""),
                    difficulty: Number(formData.get("difficulty") || 1),
                  }),
                }),
              );
              setDraftResult(data);
            });
          }}
        >
          <input
            name="topic"
            placeholder="예: 순우리말 일상 표현"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
            required
          />
          <select
            name="audience"
            defaultValue="both"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
          >
            <option value="both">both</option>
            <option value="foreign_learner">foreign_learner</option>
            <option value="korean_english_learner">korean_english_learner</option>
          </select>
          <select
            name="difficulty"
            defaultValue="1"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
          >
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "실행 중..." : "초안 생성"}
          </button>
        </form>
        {draftResult ? (
          <div className="mt-4 rounded-2xl bg-paper p-4 text-sm text-slate-700">
            <p className="font-semibold text-ink">{draftResult.draft.title}</p>
            <p className="mt-2">{draftResult.draft.summary}</p>
            <p className="mt-2 text-xs text-slate-500">저장 상태: {draftResult.draft.status}</p>
          </div>
        ) : null}
      </article>

      <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Eval Runner</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            runTask(async () => {
              const data = await parseResponse<EvalResponse>(
                await fetch("/api/admin/evals/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    evalSetId: String(formData.get("evalSetId") || ""),
                    promptVersionId: String(formData.get("promptVersionId") || ""),
                  }),
                }),
              );
              setEvalResult(data);
            });
          }}
        >
          <select
            name="evalSetId"
            defaultValue={evalSets[0]?.id}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
          >
            {evalSets.map((evalSet) => (
              <option key={evalSet.id} value={evalSet.id}>
                {evalSet.name}
              </option>
            ))}
          </select>
          <select
            name="promptVersionId"
            defaultValue={promptVersions[0]?.id}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
          >
            {promptVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.templateId.slice(0, 8)} · v{version.version} · {version.status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "실행 중..." : "Eval 실행"}
          </button>
        </form>
        {evalResult ? (
          <div className="mt-4 rounded-2xl bg-paper p-4 text-sm text-slate-700">
            <p className="font-semibold text-ink">{evalResult.evalSet}</p>
            <p className="mt-2">
              점수 {evalResult.score} / {evalResult.thresholdPassed ? "통과" : "실패"}
            </p>
            <p className="mt-2 text-xs text-slate-500">연결 버전: v{evalResult.evalRun.promptVersion}</p>
          </div>
        ) : null}
      </article>

      <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Media Script</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            runTask(async () => {
              const data = await parseResponse<MediaResponse>(
                await fetch("/api/admin/media/script", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    slug: String(formData.get("slug") || ""),
                  }),
                }),
              );
              setMediaResult(data);
            });
          }}
        >
          <select
            name="slug"
            defaultValue={publishedLessons[0]?.slug}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-clay"
          >
            {publishedLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.slug}>
                {lesson.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "실행 중..." : "영상 스크립트 생성"}
          </button>
        </form>
        {mediaResult ? (
          <div className="mt-4 rounded-2xl bg-paper p-4 text-sm text-slate-700">
            <p className="font-semibold text-ink">{mediaResult.mediaScript.title}</p>
            <p className="mt-2">{mediaResult.mediaScript.narration}</p>
            <p className="mt-2 text-xs text-slate-500">저장 상태: {mediaResult.mediaScript.status}</p>
          </div>
        ) : null}
      </article>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 xl:col-span-3">
          {error}
        </div>
      ) : null}
    </section>
  );
}
