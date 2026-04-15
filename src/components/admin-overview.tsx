import { activatePromptVersionAction } from "@/lib/admin/actions";
import type { EvalSet, PromptTemplate, PromptVersion } from "@/lib/types";

export function AdminOverview({
  evalSets,
  promptTemplates,
  promptVersions,
}: {
  evalSets: EvalSet[];
  promptTemplates: PromptTemplate[];
  promptVersions: PromptVersion[];
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {promptTemplates.map((template) => (
          <article key={template.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{template.task}</p>
            <h3 className="mt-3 text-lg font-semibold text-ink">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
            <div className="mt-4 space-y-2">
              {promptVersions
                .filter((version) => version.templateId === template.id)
                .map((version) => (
                  <div key={version.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink">
                        v{version.version} · {version.model}
                      </p>
                      <span className="text-xs uppercase tracking-[0.2em] text-clay">{version.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {version.lastEvalScore !== null
                        ? `최근 eval ${version.lastEvalScore}`
                        : "아직 eval 결과가 없습니다."}
                    </p>
                    {template.activeVersionId === version.id ? (
                      <p className="mt-2 text-xs font-medium text-sage">현재 활성 버전</p>
                    ) : (
                      <form action={activatePromptVersionAction} className="mt-2">
                        <input type="hidden" name="promptVersionId" value={version.id} />
                        <button className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-ink transition hover:border-clay hover:text-clay">
                          활성화 시도
                        </button>
                      </form>
                    )}
                  </div>
                ))}
            </div>
          </article>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {evalSets.map((evalSet) => (
          <article key={evalSet.id} className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{evalSet.task}</p>
            <h3 className="mt-3 text-xl font-semibold text-ink">{evalSet.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{evalSet.description}</p>
            <p className="mt-4 text-sm font-medium text-clay">합격 기준 점수: {evalSet.scoreThreshold}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
