import { CorrectionLab } from "@/components/correction-lab";
import { ExpressionList } from "@/components/expression-list";
import { Hero } from "@/components/hero";
import { LessonGrid } from "@/components/lesson-grid";
import { SectionTitle } from "@/components/section-title";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-4 py-6 md:px-8 md:py-8">
      <Hero />

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Learning Tracks"
          title="공개 자료로 시작하는 세 가지 학습 축"
          description="회원가입 없이 바로 탐색할 수 있다."
        />
        <LessonGrid />
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Expressions"
          title="상황과 뉘앙스를 함께 익히는 표현 카드"
          description="뜻만 아니라 쓰는 상황과 뉘앙스를 함께 보여 준다."
        />
        <ExpressionList />
      </section>

      <CorrectionLab />

      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-ink px-6 py-8 text-white md:grid-cols-3">
        <div>
          <p className="mt-3 text-2xl font-semibold">프롬프트 자산 관리</p>
        </div>
        <p className="text-sm leading-7 text-white/80">태스크별 프롬프트, 버전, 평가 기준을 함께 관리한다.</p>
        <p className="text-sm leading-7 text-white/80">검수를 마친 결과만 공개한다.</p>
      </section>
    </main>
  );
}
