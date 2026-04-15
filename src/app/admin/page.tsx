import { AdminOperatorConsole } from "@/components/admin-operator-console";
import { AdminOverview } from "@/components/admin-overview";
import { changeLessonStatus } from "@/lib/admin/actions";
import {
  listAllLessons,
  listEvalSets,
  listPublishedLessons,
  listPromptTemplates,
  listPromptVersions,
  listRecentAiRuns,
  listRecentEvalRuns,
  listRecentMediaScripts,
} from "@/lib/content/repository";
import type { ContentStatus, LessonStatusAction } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_ACTIONS: Record<ContentStatus, LessonStatusAction[]> = {
  draft: [{ label: "검수 완료로 이동", nextStatus: "reviewed" }, { label: "보관", nextStatus: "archived" }],
  reviewed: [{ label: "공개", nextStatus: "published" }, { label: "보관", nextStatus: "archived" }],
  published: [{ label: "보관", nextStatus: "archived" }],
  archived: [{ label: "초안으로 복귀", nextStatus: "draft" }],
};

export default async function AdminPage() {
  const [promptTemplates, promptVersions, evalSets, lessons, publishedLessons, recentEvalRuns, recentAiRuns, recentMediaScripts] = await Promise.all([
    listPromptTemplates(),
    listPromptVersions(),
    listEvalSets(),
    listAllLessons(),
    listPublishedLessons(),
    listRecentEvalRuns(),
    listRecentAiRuns(),
    listRecentMediaScripts(),
  ]);

  return (
    <div className="space-y-8">
      <AdminOverview evalSets={evalSets} promptTemplates={promptTemplates} promptVersions={promptVersions} />
      <AdminOperatorConsole
        evalSets={evalSets}
        promptVersions={promptVersions}
        publishedLessons={publishedLessons}
      />
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {STATUS_ACTIONS[lesson.status].map((action) => (
                    <form key={action.nextStatus} action={changeLessonStatus}>
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <input type="hidden" name="nextStatus" value={action.nextStatus} />
                      <button className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-ink transition hover:border-clay hover:text-clay">
                        {action.label}
                      </button>
                    </form>
                  ))}
                </div>
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
                <p className="mt-2 text-sm text-clay">기준 점수 {set.scoreThreshold}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recent Runs</p>
            <div className="mt-3 space-y-3">
              {recentEvalRuns.length > 0 ? (
                recentEvalRuns.map((run) => (
                  <div key={run.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-ink">{run.evalSetName}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-clay">
                        {run.thresholdPassed ? "passed" : "failed"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">점수 {run.score}</p>
                    <p className="mt-1 text-xs text-slate-500">prompt v{run.promptVersion}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(run.createdAt).toLocaleString("ko-KR")}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white p-4 text-sm text-slate-600">아직 저장된 eval 실행 이력이 없습니다.</p>
              )}
            </div>
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Run Log</p>
          <div className="mt-4 space-y-3">
            {recentAiRuns.length > 0 ? (
              recentAiRuns.map((run) => (
                <div key={run.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-ink">{run.task}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-clay">
                      {run.usedFallback ? "fallback" : "model"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    v{run.promptVersion} · {run.model}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(run.createdAt).toLocaleString("ko-KR")}</p>
                  {run.errorMessage ? <p className="mt-2 text-xs text-red-600">{run.errorMessage}</p> : null}
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-slate-600">아직 저장된 AI 실행 기록이 없습니다.</p>
            )}
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-paper p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Media Scripts</p>
          <div className="mt-4 space-y-3">
            {recentMediaScripts.length > 0 ? (
              recentMediaScripts.map((script) => (
                <div key={script.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-ink">{script.title}</p>
                    <span className="text-xs uppercase tracking-[0.2em] text-clay">{script.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{script.contentSlug}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(script.createdAt).toLocaleString("ko-KR")}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-slate-600">아직 저장된 영상 스크립트가 없습니다.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
