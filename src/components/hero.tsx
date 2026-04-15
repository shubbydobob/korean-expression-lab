import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-[#fffdf8] px-6 py-12 shadow-panel md:px-10 md:py-16">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,244,236,0.9))]" />
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-black/10 bg-[#b3321b]/[0.06]" />
      <div className="relative grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-black/55">
              Public Korean Expression Archive
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[1.08] text-black md:text-7xl">
              말의 결을 바로 세우는
              <br />
              한글 표현 아카이브
            </h1>
            <p className="max-w-2xl text-base leading-8 text-black/72 md:text-lg">
              순우리말, 영어 표현, 한국어 읽기 이해를 공공 자료처럼 차분하게 열어 둡니다. 공개되는
              콘텐츠는 모두 사람 검수를 거친 결과만 담습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="#correction-lab"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              AI 교정 체험하기
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-black/5"
            >
              관리자 워크스페이스
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-black/10 bg-white/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">정제된 공개 자료</p>
              <p className="mt-2 text-sm leading-6 text-black/75">
                한 번 걸러낸 문장과 설명만 공공 아카이브처럼 제공합니다.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-black/10 bg-white/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">먹빛 중심 구성</p>
              <p className="mt-2 text-sm leading-6 text-black/75">
                흰 종이와 검은 획을 닮은 톤으로 집중도를 높였습니다.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-black/10 bg-white/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">설명 가능한 AI</p>
              <p className="mt-2 text-sm leading-6 text-black/75">
                교정과 생성은 이유와 평가 기준을 함께 남기는 흐름으로 관리합니다.
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border border-black/10 bg-black/5" />
          <div className="relative overflow-hidden rounded-[2rem] border border-black/15 bg-white p-5">
            <div className="rounded-[1.7rem] border border-black/10 bg-[#fbf8f1] p-4">
              <Image
                src="/generated/hero-hangul-poster-v1.png"
                alt="자음과 모음이 큰 활자로 구성된 한글 포스터"
                width={1024}
                height={1536}
                priority
                className="h-auto w-full rounded-[1.3rem] border border-black/10"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-black/10 bg-[#fbf8f1] px-4 py-4 sm:col-span-2">
                <p className="font-display text-2xl text-black">자모 포스터</p>
                <p className="mt-2 text-sm leading-6 text-black/68">
                  한글 자음과 모음을 전면에 세운 편집 이미지입니다. 흰 종이와 먹색 활자의 대비로 첫 화면의
                  인상을 정리했습니다.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-black/10 bg-[#fbf8f1] px-4 py-4">
                <p className="font-display text-2xl text-black">한국적 인상</p>
                <p className="mt-2 text-sm leading-6 text-black/68">
                  검은 활자, 붉은 낙관, 종이 질감을 중심으로 또렷한 정체성을 만듭니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
