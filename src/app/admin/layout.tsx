import Link from "next/link";

import { logoutAdmin } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">Admin Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">콘텐츠 검수와 AI 하네스 운영</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-ink">
              공개 홈
            </Link>
            <form action={logoutAdmin}>
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">로그아웃</button>
            </form>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
