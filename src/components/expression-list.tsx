import { expressions } from "@/lib/content/catalog";

export function ExpressionList() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {expressions.map((expression) => (
        <article key={expression.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-ink">{expression.phrase}</p>
          <p className="mt-1 text-sm text-clay">{expression.translation}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">{expression.context}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">{expression.nuance}</p>
        </article>
      ))}
    </div>
  );
}
