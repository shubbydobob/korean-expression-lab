import { lessons } from "@/lib/content/catalog";

export function LessonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {lessons.map((lesson) => (
        <article key={lesson.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">Lv.{lesson.difficulty}</span>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{lesson.audience}</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">{lesson.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{lesson.summary}</p>
          <p className="mt-4 text-sm font-medium text-clay">{lesson.focus}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.topicTags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
