import type { LessonCard } from "@/lib/types";

export function LessonGrid({ lessons }: { lessons: LessonCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {lessons.map((lesson) => (
        <article
          key={lesson.id}
          className="group rounded-[1.75rem] border border-black/10 bg-white/95 p-6 shadow-[0_18px_45px_rgba(17,17,17,0.06)] transition hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-black/10 bg-[#f5f0e6] px-3 py-1 text-xs font-semibold text-black">
              Lv.{lesson.difficulty}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-black/35">{lesson.audience}</span>
          </div>
          <h3 className="mt-5 font-display text-3xl leading-tight text-black">{lesson.title}</h3>
          <p className="mt-4 text-sm leading-7 text-black/68">{lesson.summary}</p>
          <p className="mt-5 border-l-2 border-black pl-4 text-sm leading-7 text-black/78">{lesson.focus}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.topicTags.map((tag) => (
              <span key={tag} className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">
                {tag}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
