"use client";

import { useState, useTransition } from "react";

import type { CorrectionResult } from "@/lib/types";

const initialText = "내일 회의 자료를 한 번 더 확인 부탁드릴게요.";

type CorrectionApiResponse =
  | { ok: true; data: CorrectionResult }
  | { ok: false; error: { message: string } };

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

      const data = (await response.json()) as CorrectionApiResponse;
      if (!response.ok || !data.ok) {
        setError(data.ok ? "교정 요청에 실패했습니다." : data.error.message);
        return;
      }

      setResult(data.data);
    });
  }

  return (
    <section
      id="correction-lab"
      className="grid gap-6 rounded-[2.25rem] border border-black/10 bg-[#fffdf8] p-6 md:grid-cols-[0.95fr_1.05fr]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">AI Correction Lab</p>
        <h3 className="mt-3 font-display text-4xl leading-tight text-black md:text-5xl">
          문장을 다듬는 이유까지
          <br />
          함께 보여 주는 교정 실험실
        </h3>
        <p className="mt-4 text-sm leading-8 text-black/68">
          맞춤법만 고치는 데서 끝내지 않고, 왜 더 자연스러운지와 어떤 대안을 쓸 수 있는지까지 정리해
          보여 줍니다. 모델 응답이 없을 때도 기본 fallback 결과가 동작합니다.
        </p>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <textarea
            name="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-40 w-full rounded-[1.4rem] border border-black/15 bg-[#f8f4eb] px-4 py-4 text-sm text-black outline-none transition focus:border-black"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:opacity-60"
          >
            {isPending ? "교정 중..." : "문장 교정하기"}
          </button>
        </form>
      </div>
      <div className="rounded-[1.75rem] border border-black/8 bg-[#f8f4eb] p-5">
        <p className="text-sm font-semibold text-black">교정 결과</p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {result ? (
          <div className="mt-4 space-y-4 text-sm text-black/75">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">교정 문장</p>
              <p className="mt-2 rounded-2xl border border-black/8 bg-white p-4 text-base font-medium text-black">
                {result.corrected}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">한 줄 요약</p>
              <p className="mt-2 leading-7">{result.summary}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">설명 메모</p>
              <ul className="mt-2 space-y-2">
                {result.notes.map((note) => (
                  <li key={note} className="rounded-xl border border-black/8 bg-white px-4 py-3">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">다른 표현</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.alternatives.map((alternative) => (
                  <span key={alternative} className="rounded-full border border-black/10 bg-white px-3 py-2">
                    {alternative}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-black/60">
            문장을 입력하면 교정 결과와 설명이 이 영역에 표시됩니다.
          </p>
        )}
      </div>
    </section>
  );
}
