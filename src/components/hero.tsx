import Image from "next/image";
import Link from "next/link";

const trustPoints = ["검수 후 공개", "설명 중심 교정", "차분한 열람 동선"];

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-black/10 bg-[#fffdf8] px-5 py-6 shadow-panel md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,241,232,0.96))]" />
      <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-black/10 bg-[#b3321b]/[0.05]" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(340px,1fr)] lg:items-center">
        <div className="order-1 space-y-6 rounded-[2rem] border border-black/10 bg-white/82 p-6 backdrop-blur-sm md:p-7">
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-black/48">
              Public Korean Expression Archive
            </p>
            <h1 className="max-w-2xl font-display text-[2.9rem] leading-[0.98] text-black md:text-[4.9rem]">
              말의 결을 바로 세우는
              <br />
              한글 표현 아카이브
            </h1>
            <p className="max-w-xl text-sm leading-8 text-black/72 md:text-lg">
              순우리말, 영어 표현, 읽기 이해 자료를 흰 종이 위에 정갈하게 정리했습니다. 공개
              콘텐츠는 사람 검수를 거친 결과만 남기고, AI는 교정과 설명을 보조하는 도구로만
              사용합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#correction-lab"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              AI 교정 체험하기
            </Link>
            <Link
              href="#learning-tracks"
              className="text-sm font-semibold text-black/64 underline decoration-black/20 underline-offset-4 transition hover:text-black"
            >
              자료 바로 보기
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustPoints.map((item) => (
              <span
                key={item}
                className="rounded-full border border-black/10 bg-[#fcfaf4] px-4 py-2 text-sm text-black/72"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="text-sm leading-7 text-black/50">
            관리자 화면은 내부 운영용입니다. 일반 사용자는 공개 자료와 교정 데모만 이용하면 됩니다.
          </p>
        </div>

        <div className="order-2">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-4 rounded-[2rem] border border-black/10 bg-black/5" />
            <div className="relative overflow-hidden rounded-[2rem] border border-black/12 bg-white p-4 md:p-5">
              <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-black/40">Archive Poster</p>
                  <p className="mt-2 font-display text-3xl text-black md:text-4xl">자모 표지</p>
                </div>
                <span className="mt-1 inline-flex h-4 w-4 rounded-full bg-[#b3321b]" aria-hidden />
              </div>

              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-black/8 bg-[#fbf7ee]">
                <Image
                  src="/generated/hero-hangul-poster-v1.png"
                  alt="한글 자음과 모음을 먹선 포스터처럼 배치한 표지 이미지"
                  width={1024}
                  height={1536}
                  priority
                  className="h-auto w-full"
                />
              </div>

              <p className="mt-4 rounded-[1.25rem] border border-black/10 bg-[#fbf7ee] px-4 py-4 text-sm leading-7 text-black/72">
                큰 자모, 넓은 여백, 붉은 낙관 한 점만으로 한국어 자료실의 첫 인상을 만들었습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
