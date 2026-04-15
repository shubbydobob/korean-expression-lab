import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-paper px-6 py-12 shadow-panel md:px-10 md:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(233,216,166,0.55),_transparent_60%)]" />
      <div className="relative grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink md:text-6xl">
              순우리말과 정확한 표현을 함께 익히는 공개 학습 플랫폼
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
              순우리말, 영어 표현, 한국어 독해를 공개 자료로 익히고 관리자 검수를 거친 자료만 공개한다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="#correction-lab" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay">
              AI 교정 체험하기
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
            >
              관리자 워크스페이스
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-[1.5rem] bg-white/80 p-5 backdrop-blur">
          <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
            <p className="mt-3 text-lg font-semibold text-ink">순우리말 알리기</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">외래어와 번역투를 줄인다.</p>
          </div>
          <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
            <p className="mt-3 text-lg font-semibold text-ink">Prompt / Eval / Review</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">프롬프트와 평가를 함께 관리한다.</p>
          </div>
          <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4">
            <p className="mt-3 text-lg font-semibold text-ink">YouTube Ready</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">발행 수업을 영상용으로 확장한다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
