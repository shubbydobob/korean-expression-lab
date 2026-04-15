import { CorrectionLab } from "@/components/correctionLab";
import { ExpressionList } from "@/components/expression-list";
import { Hero } from "@/components/hero";
import { LessonGrid } from "@/components/lesson-grid";
import { SectionTitle } from "@/components/section-title";
import { listExpressionCards, listPublishedLessons } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lessons, expressions] = await Promise.all([listPublishedLessons(), listExpressionCards()]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-14 px-4 py-6 md:px-8 md:py-8">
      <Hero />

      <CorrectionLab />

      <section id="learning-tracks" className="space-y-8">
        <SectionTitle
          eyebrow="Learning Tracks"
          title="생활 속 표현을 차분하게 익히는 학습 갈래"
          description="짧은 설명과 예문으로 표현의 쓰임을 정리합니다."
        />
        <LessonGrid lessons={lessons} />
      </section>

      <section id="expressions" className="space-y-8">
        <SectionTitle
          eyebrow="Expressions"
          title="자주 헷갈리는 표현 카드"
          description="직역보다 실제 쓰임과 맥락을 먼저 보여줍니다."
        />
        <ExpressionList expressions={expressions} />
      </section>

      <section className="grid gap-6 rounded-[2.25rem] border border-black/10 bg-white px-6 py-8 md:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/45">Public Principles</p>
          <p className="mt-3 font-display text-4xl text-black md:text-5xl">공개 원칙</p>
        </div>
        <div className="grid gap-4 text-sm leading-8 text-black/72 md:grid-cols-2">
          <p>공개 자료는 모두 검수 후 게시합니다.</p>
          <p>생성 속도보다 교육 품질과 설명 가능성을 우선합니다.</p>
        </div>
      </section>
    </main>
  );
}
