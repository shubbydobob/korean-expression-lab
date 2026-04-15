"use client";

import { useActionState } from "react";

import { loginAdmin } from "@/lib/admin/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <p className="text-xs uppercase tracking-[0.3em] text-sage">Internal Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          운영 전용 화면입니다. `.env.local`에 설정한 관리자 자격 증명으로만 접근할 수 있습니다.
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-ink">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-clay"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-clay"
              required
            />
          </div>
          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay disabled:opacity-60"
          >
            {pending ? "인증 중..." : "로그인"}
          </button>
        </form>
      </div>
    </main>
  );
}
