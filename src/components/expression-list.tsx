import type { ExpressionCard } from "@/lib/types";

export function ExpressionList({ expressions }: { expressions: ExpressionCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {expressions.map((expression) => (
        <article key={expression.id} className="rounded-[1.75rem] border border-black/10 bg-[#fffefb] p-6">
          <p className="font-display text-3xl text-black">{expression.phrase}</p>
          <p className="mt-2 text-sm tracking-[0.08em] text-[#8b2d1f]">{expression.translation}</p>
          <div className="mt-5 space-y-3 border-t border-black/8 pt-4">
            <p className="text-sm leading-7 text-black/68">{expression.context}</p>
            <p className="text-sm leading-7 text-black/56">{expression.nuance}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
