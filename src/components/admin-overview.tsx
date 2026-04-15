import { evalSets, promptTemplates } from "@/lib/content/catalog";

export function AdminOverview() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {promptTemplates.map((template) => (
          <article key={template.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{template.task}</p>
            <h3 className="mt-3 text-lg font-semibold text-ink">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
            <p className="mt-4 text-sm font-medium text-clay">
              Active v{template.activeVersion} · {template.model}
            </p>
          </article>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {evalSets.map((evalSet) => (
          <article key={evalSet.id} className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{evalSet.task}</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{evalSet.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{evalSet.description}</p>
            <p className="mt-4 text-sm font-medium text-clay">승격 기준 점수: {evalSet.scoreThreshold}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
