import { AdminOverview } from "@/components/admin-overview";
import { evalSets, lessons } from "@/lib/content/catalog";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <AdminOverview />
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review Queue</p>
          <div className="mt-4 space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-ink">{lesson.title}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-clay">{lesson.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{lesson.summary}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Eval Status</p>
          <div className="mt-4 space-y-3">
            {evalSets.map((set) => (
              <div key={set.id} className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-ink">{set.name}</p>
                <p className="mt-2 text-sm text-slate-600">{set.description}</p>
                <p className="mt-2 text-sm text-clay">임계점수 {set.scoreThreshold}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
