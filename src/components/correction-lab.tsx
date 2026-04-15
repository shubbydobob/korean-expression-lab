"use client";

import { useState, useTransition } from "react";

import type { CorrectionResult } from "@/lib/types";

const initialText = "내일 회의 자료를 체크 부탁드릴께요.";

export function CorrectionLab() {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const nextText = String(formData.get("text") || "");

    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/correction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: nextText, language: "ko" }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error || "교정 요청에 실패했습니다.");
        return;
      }

      const data = (await response.json()) as CorrectionResult;
      setResult(data);
    });
  }

  return (
    <section id="correction-lab" className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sage">AI Correction Lab</p>
        <h3 className="mt-3 text-2xl font-semibold text-ink">교정 이유까지 보여 주는 교정 실험실</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">맞춤법, 문맥, 공손도를 함께 살핀다. API 키가 없으면 fallback으로 동작한다.</p>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <textarea
            name="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-40 w-full rounded-[1.2rem] border border-slate-300 bg-paper px-4 py-4 text-sm text-ink outline-none transition focus:border-clay"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay disabled:opacity-60"
          >
            {isPending ? "교정 중..." : "문장 교정하기"}
          </button>
        </form>
      </div>
      <div className="rounded-[1.5rem] bg-paper p-5">
        <p className="text-sm font-semibold text-ink">결과</p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {result ? (
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">교정문</p>
              <p className="mt-2 rounded-2xl bg-white p-4 text-base font-medium text-ink">{result.corrected}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">요약</p>
              <p className="mt-2 leading-7">{result.summary}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">설명</p>
              <ul className="mt-2 space-y-2">
                {result.notes.map((note) => (
                  <li key={note} className="rounded-xl bg-white px-4 py-3">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">대안 표현</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.alternatives.map((alternative) => (
                  <span key={alternative} className="rounded-full border border-slate-300 px-3 py-2">
                    {alternative}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-600">문장을 입력하면 교정 결과가 표시된다.</p>
        )}
      </div>
    </section>
  );
}
