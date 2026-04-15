import { CorrectionLab } from "@/components/correction-lab";
import { ExpressionList } from "@/components/expression-list";
import { Hero } from "@/components/hero";
import { LessonGrid } from "@/components/lesson-grid";
import { SectionTitle } from "@/components/section-title";
import { listExpressionCards, listPublishedLessons } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lessons, expressions] = await Promise.all([listPublishedLessons(), listExpressionCards()]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-4 py-6 md:px-8 md:py-8">
      <Hero />

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Learning Tracks"
          title="생활 속 말의 결을 차분하게 익히는 학습 갈래"
          description="공공 자료실처럼 흩어보기 쉬운 구조로 정리한 공개 학습 카드입니다."
        />
        <LessonGrid lessons={lessons} />
      </section>

      <section className="space-y-8">
        <SectionTitle
          eyebrow="Expressions"
          title="표현의 온도와 맥락을 함께 읽는 카드 모음"
          description="직역보다 실제로 어떻게 들리고 어떤 장면에서 살아나는지를 우선해 보여 줍니다."
        />
        <ExpressionList expressions={expressions} />
      </section>

      <CorrectionLab />

      <section className="grid gap-6 rounded-[2.25rem] border border-black/10 bg-white px-6 py-8 md:grid-cols-3">
        <div>
          <p className="font-display text-4xl text-black">검수의 원칙</p>
        </div>
        <p className="text-sm leading-8 text-black/72">
          프롬프트, 버전, 평가 기준을 분리해 관리하고, 결과는 검수 상태를 거쳐 공개 영역으로만 전달합니다.
        </p>
        <p className="text-sm leading-8 text-black/72">
          생성 속도보다 설명 가능성과 운영 가능성을 앞세우는 방향을 홈 화면에서도 그대로 드러냅니다.
        </p>
      </section>
    </main>
  );
}
