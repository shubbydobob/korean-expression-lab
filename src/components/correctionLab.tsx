"use client";

import { useState, useTransition } from "react";

import type { CorrectionResult } from "@/lib/types";

const initialText = "오늘 회의 자료를 한 번 더 확인 부탁드릴게요.";

type CorrectionApiResponse =
  | { ok: true; data: CorrectionResult }
  | { ok: false; error: { message: string } };

function PreviewRows() {
  return (
    <div className="mt-4 space-y-4 text-sm">
      {["교정 문장", "한줄 요약", "설명", "다른 표현"].map((label, index) => (
        <div key={label}>
          <p className="text-xs uppercase tracking-[0.22em] text-black/40">{label}</p>
          <div
            className={`mt-2 rounded-2xl border border-black/8 bg-white/70 ${
              index === 0 ? "h-16" : index === 1 ? "h-12" : "h-20"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export function CorrectionLab() {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const nextText = String(formData.get("text") || "");

    startTransition(async () => {
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/correction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: nextText, language: "ko" }),
        });

        const data = (await response.json()) as CorrectionApiResponse;
        if (!response.ok || !data.ok) {
          setError(data.ok ? "교정 요청에 실패했습니다. 잠시 후 다시 시도해 주세요." : data.error.message);
          return;
        }

        setResult(data.data);
      } catch {
        setError("교정 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <section
      id="correction-lab"
      className="grid gap-5 rounded-[2.25rem] border border-black/10 bg-[#fffdf8] p-5 md:grid-cols-[0.92fr_1.08fr] md:p-6"
    >
      <div className="rounded-[1.8rem] border border-black/10 bg-white p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">AI Correction Lab</p>
        <h3 className="mt-3 font-display text-4xl leading-tight text-black md:text-5xl">
          문장을 다듬는 이유까지
          <br />
          보여주는 AI 교정
        </h3>
        <p className="mt-4 text-sm leading-8 text-black/68">
          맞춤법만 고치지 않고, 왜 어색한지와 어떤 표현이 더 자연스러운지 함께 정리합니다.
        </p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="sr-only">교정할 문장 입력</span>
            <textarea
              name="text"
              value={text}
              disabled={isPending}
              placeholder="예: 오늘 회의 자료를 한번 더 확인 부탁드릴게요."
              onChange={(event) => setText(event.target.value)}
              className="min-h-44 w-full rounded-[1.4rem] border border-black/15 bg-[#f8f4eb] px-4 py-4 text-sm leading-7 text-black outline-none transition focus:border-black disabled:opacity-70"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:opacity-60"
          >
            {isPending ? "교정 중..." : "문장 교정하기"}
          </button>
        </form>
      </div>

      <div className="rounded-[1.8rem] border border-black/8 bg-[#f8f4eb] p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black">교정 결과</p>
          {result && !error ? (
            <span role="status" aria-live="polite" className="text-xs text-black/55">
              교정이 완료되었습니다.
            </span>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-700"
          >
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-4 space-y-4 text-sm text-black/75">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">교정 문장</p>
              <p className="mt-2 rounded-2xl border border-black/8 bg-white p-4 text-base font-medium text-black">
                {result.corrected}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">한줄 요약</p>
              <p className="mt-2 leading-7">{result.summary}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">설명</p>
              <ul className="mt-2 space-y-2">
                {result.notes.slice(0, 3).map((note) => (
                  <li key={note} className="rounded-xl border border-black/8 bg-white px-4 py-3 leading-7">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">다른 표현</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.alternatives.slice(0, 3).map((alternative) => (
                  <span key={alternative} className="rounded-full border border-black/10 bg-white px-3 py-2">
                    {alternative}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-black/60">
              문장을 입력하면 교정 결과와 설명이 이곳에 표시됩니다.
            </p>
            <PreviewRows />
          </>
        )}
      </div>
    </section>
  );
}
