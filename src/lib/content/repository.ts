import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { promptRegistry } from "@/lib/ai/prompts";
import { evalSets, expressions, lessons, promptTemplates, promptVersionSeeds } from "@/lib/content/catalog";
import { getPostgresPool } from "@/lib/db/postgres";
import { getDatabaseEnv } from "@/lib/env";
import type {
  AiRunRecord,
  Audience,
  ContentStatus,
  EvalSet,
  EvalRunRecord,
  ExpressionCard,
  LessonCard,
  MediaScriptRecord,
  PromptVersion,
  PromptTask,
  PromptTemplate,
} from "@/lib/types";
import type { Pool } from "pg";

type ResolvedPromptVersion = {
  template: PromptTemplate;
  version: PromptVersion;
};

type ContentStore = {
  lessons: LessonCard[];
  expressions: ExpressionCard[];
  promptTemplates: PromptTemplate[];
  promptVersions: PromptVersion[];
  evalSets: EvalSet[];
  aiRuns: AiRunRecord[];
  evalRuns: EvalRunRecord[];
  mediaScripts: MediaScriptRecord[];
};

const STORE_PATH = path.join(process.cwd(), "src/lib/content/store.json");
const DEFAULT_STORE: ContentStore = {
  lessons,
  expressions,
  promptTemplates,
  promptVersions: [
    {
      id: "44444444-4444-4444-4444-444444444001",
      templateId: "33333333-3333-3333-3333-333333333001",
      version: 3,
      model: "gpt-5.4-mini",
      systemPrompt: promptRegistry.correction.system,
      instructions: promptRegistry.correction.instructions,
      status: "active",
      notes: "기본 교정용 활성 버전",
      lastEvalRunId: null,
      lastEvalScore: null,
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444002",
      templateId: "33333333-3333-3333-3333-333333333002",
      version: 2,
      model: "gpt-5.4-mini",
      systemPrompt: promptRegistry.lesson_generation.system,
      instructions: promptRegistry.lesson_generation.instructions,
      status: "active",
      notes: "기본 수업 초안 생성용 활성 버전",
      lastEvalRunId: null,
      lastEvalScore: null,
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
    {
      id: "44444444-4444-4444-4444-444444444003",
      templateId: "33333333-3333-3333-3333-333333333003",
      version: 1,
      model: "gpt-5.4-mini",
      systemPrompt: promptRegistry.video_script_generation.system,
      instructions: promptRegistry.video_script_generation.instructions,
      status: "active",
      notes: "기본 영상 스크립트 생성용 활성 버전",
      lastEvalRunId: null,
      lastEvalScore: null,
      updatedAt: "2026-04-15T00:00:00.000Z",
    },
  ],
  evalSets,
  aiRuns: [],
  evalRuns: [],
  mediaScripts: [],
};

const TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["reviewed", "archived"],
  reviewed: ["published", "archived"],
  published: ["archived"],
  archived: ["draft"],
};

function normalizePromptVersion(version: PromptVersion, task: PromptTask): PromptVersion {
  const fallback = promptRegistry[task];
  return {
    ...version,
    systemPrompt: version.systemPrompt || fallback.system,
    instructions: version.instructions?.length ? version.instructions : fallback.instructions,
  };
}

function buildPromptFingerprint(systemPrompt: string, instructions: string[]) {
  return createHash("sha256")
    .update(JSON.stringify({ systemPrompt, instructions }))
    .digest("hex")
    .slice(0, 16);
}

function getPool() {
  return getPostgresPool(getDatabaseEnv().url);
}

async function withFallback<T>(runDb: (pool: Pool) => Promise<T>, runFile: () => Promise<T>): Promise<T> {
  const pool = getPool();
  if (!pool) {
    return runFile();
  }

  try {
    return await runDb(pool);
  } catch {
    return runFile();
  }
}

function sortLessons(items: LessonCard[]) {
  return [...items].sort((left, right) => left.difficulty - right.difficulty || left.title.localeCompare(right.title));
}

async function readStore(): Promise<ContentStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as ContentStore;
  } catch {
    await writeStore(DEFAULT_STORE);
    return DEFAULT_STORE;
  }
}

async function writeStore(store: ContentStore) {
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function updateStore<T>(updater: (store: ContentStore) => T | Promise<T>): Promise<T> {
  const store = await readStore();
  const result = await updater(store);
  await writeStore(store);
  return result;
}

export async function listPublishedLessons(): Promise<LessonCard[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, slug, title, summary, audience, status, difficulty, topic_tags, body
         from contents
         where status = 'published'
         order by difficulty asc, title asc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        audience: row.audience,
        status: row.status,
        topicTags: row.topic_tags ?? [],
        difficulty: row.difficulty,
        focus: row.body?.focus ?? row.summary,
      }));
    },
    async () => {
      const store = await readStore();
      return sortLessons(store.lessons.filter((lesson) => lesson.status === "published"));
    },
  );
}

export async function listAllLessons(): Promise<LessonCard[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, slug, title, summary, audience, status, difficulty, topic_tags, body
         from contents
         order by difficulty asc, title asc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        audience: row.audience,
        status: row.status,
        topicTags: row.topic_tags ?? [],
        difficulty: row.difficulty,
        focus: row.body?.focus ?? row.summary,
      }));
    },
    async () => {
      const store = await readStore();
      return sortLessons(store.lessons);
    },
  );
}

export async function listExpressionCards(): Promise<ExpressionCard[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, phrase, nuance, context_note, example_sentences
         from expressions
         order by created_at desc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        phrase: row.phrase,
        translation: row.example_sentences?.translation ?? "",
        context: row.context_note,
        nuance: row.nuance,
      }));
    },
    async () => {
      const store = await readStore();
      return [...store.expressions];
    },
  );
}

export async function listPromptTemplates(): Promise<PromptTemplate[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select t.id, t.slug, t.title, t.task, t.description, v.id as active_version_id
         from prompt_templates t
         left join prompt_versions v on v.template_id = t.id and v.is_active = true
         order by t.title asc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        task: row.task,
        description: row.description,
        activeVersionId: row.active_version_id,
      }));
    },
    async () => {
      const store = await readStore();
      return [...store.promptTemplates];
    },
  );
}

export async function listPromptVersions(): Promise<PromptVersion[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, template_id, version, model, system_prompt, instructions, status, notes, last_eval_run_id, last_eval_score, updated_at
         from prompt_versions
         order by template_id asc, version desc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        templateId: row.template_id,
        version: row.version,
        model: row.model,
        systemPrompt: row.system_prompt,
        instructions: row.instructions ?? [],
        status: row.status,
        notes: row.notes,
        lastEvalRunId: row.last_eval_run_id,
        lastEvalScore: row.last_eval_score === null ? null : Number(row.last_eval_score),
        updatedAt: row.updated_at.toISOString(),
      }));
    },
    async () => {
      const store = await readStore();
      return [...store.promptVersions]
        .map((version) => {
          const template = store.promptTemplates.find((item) => item.id === version.templateId);
          return normalizePromptVersion(version, template?.task ?? "correction");
        })
        .sort((left, right) => left.templateId.localeCompare(right.templateId) || right.version - left.version);
    },
  );
}

export async function listEvalSets(): Promise<EvalSet[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, task, name, description, score_threshold, cases
         from eval_sets
         order by created_at desc`,
      );

      return result.rows.map((row) => ({
        id: row.id,
        task: row.task,
        name: row.name,
        description: row.description,
        scoreThreshold: row.score_threshold,
        cases: row.cases,
      }));
    },
    async () => {
      const store = await readStore();
      return [...store.evalSets];
    },
  );
}

export async function getEvalSetById(id?: string): Promise<EvalSet | undefined> {
  return withFallback(
    async (pool) => {
      const result = id
        ? await pool.query(
            `select id, task, name, description, score_threshold, cases
             from eval_sets where id = $1`,
            [id],
          )
        : await pool.query(
            `select id, task, name, description, score_threshold, cases
             from eval_sets
             order by created_at asc
             limit 1`,
          );

      const row = result.rows[0];
      if (!row) {
        return undefined;
      }

      return {
        id: row.id,
        task: row.task,
        name: row.name,
        description: row.description,
        scoreThreshold: row.score_threshold,
        cases: row.cases,
      };
    },
    async () => {
      const store = await readStore();
      if (!id) {
        return store.evalSets[0];
      }

      return store.evalSets.find((item) => item.id === id);
    },
  );
}

export async function getPublishedLessonBySlug(slug: string): Promise<LessonCard | undefined> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, slug, title, summary, audience, status, difficulty, topic_tags, body
         from contents
         where slug = $1 and status = 'published'
         limit 1`,
        [slug],
      );

      const row = result.rows[0];
      if (!row) {
        return undefined;
      }

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        audience: row.audience,
        status: row.status,
        topicTags: row.topic_tags ?? [],
        difficulty: row.difficulty,
        focus: row.body?.focus ?? row.summary,
      };
    },
    async () => {
      const store = await readStore();
      return store.lessons.find((lesson) => lesson.slug === slug && lesson.status === "published");
    },
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createLessonId(items: LessonCard[]) {
  return `lesson-${String(items.length + 1).padStart(3, "0")}`;
}

export async function createLessonDraftRecord(input: {
  topic: string;
  audience: Audience;
  difficulty: number;
  title: string;
  summary: string;
  objectives: string[];
  exercises: string[];
}): Promise<LessonCard> {
  return withFallback(
    async (pool) => {
      const baseSlug = slugify(input.topic);
      let slug = baseSlug || `lesson-${Date.now()}`;
      let suffix = 2;

      while (true) {
        const existing = await pool.query(`select 1 from contents where slug = $1 limit 1`, [slug]);
        if (existing.rowCount === 0) {
          break;
        }
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      const id = randomUUID();
      await pool.query(
        `insert into contents (
          id, slug, title, summary, audience, status, difficulty, topic_tags, body
        ) values ($1, $2, $3, $4, $5, 'draft', $6, $7, $8::jsonb)`,
        [
          id,
          slug,
          input.title,
          input.summary,
          input.audience,
          input.difficulty,
          [input.topic],
          JSON.stringify({
            focus: input.objectives[0] || input.exercises[0] || input.summary,
            objectives: input.objectives,
            exercises: input.exercises,
          }),
        ],
      );

      return {
        id,
        slug,
        title: input.title,
        summary: input.summary,
        audience: input.audience,
        status: "draft",
        topicTags: [input.topic],
        difficulty: input.difficulty,
        focus: input.objectives[0] || input.exercises[0] || input.summary,
      };
    },
    async () => updateStore((store) => {
    const baseSlug = slugify(input.topic);
    const existingSlugs = new Set(store.lessons.map((lesson) => lesson.slug));
    let slug = baseSlug || `lesson-${Date.now()}`;
    let suffix = 2;

    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const draft: LessonCard = {
      id: createLessonId(store.lessons),
      slug,
      title: input.title,
      summary: input.summary,
      audience: input.audience,
      status: "draft",
      topicTags: [input.topic],
      difficulty: input.difficulty,
      focus: input.objectives[0] || input.exercises[0] || input.summary,
    };

    store.lessons.unshift(draft);
    return draft;
    }),
  );
}

export async function updateLessonStatus(id: string, nextStatus: ContentStatus): Promise<LessonCard> {
  return withFallback(
    async (pool) => {
      const found = await pool.query(
        `select id, slug, title, summary, audience, status, difficulty, topic_tags, body
         from contents where id = $1 limit 1`,
        [id],
      );
      const lesson = found.rows[0];
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      const currentStatus = lesson.status as ContentStatus;

      if (!TRANSITIONS[currentStatus].includes(nextStatus)) {
        throw new Error(`Cannot move lesson from ${currentStatus} to ${nextStatus}`);
      }

      await pool.query(`update contents set status = $2, updated_at = now() where id = $1`, [id, nextStatus]);
      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        audience: lesson.audience,
        status: nextStatus,
        topicTags: lesson.topic_tags ?? [],
        difficulty: lesson.difficulty,
        focus: lesson.body?.focus ?? lesson.summary,
      };
    },
    async () =>
      updateStore((store) => {
        const lesson = store.lessons.find((item) => item.id === id);

        if (!lesson) {
          throw new Error("Lesson not found");
        }

        if (!TRANSITIONS[lesson.status].includes(nextStatus)) {
          throw new Error(`Cannot move lesson from ${lesson.status} to ${nextStatus}`);
        }

        lesson.status = nextStatus;
        return lesson;
      }),
  );
}

export async function createAiRun(input: {
  task: PromptTask;
  promptTemplateId: string;
  promptVersionId: string;
  promptVersion: number;
  model: string;
  promptFingerprint: string;
  promptSnapshot: AiRunRecord["promptSnapshot"];
  input: unknown;
  output: unknown;
  usedFallback: boolean;
  fallbackReason: string | null;
  errorMessage: string | null;
}): Promise<AiRunRecord> {
  return withFallback(
    async (pool) => {
      const id = `ai-run-${Date.now()}`;
      await pool.query(
        `insert into ai_runs (
          id, task, prompt_template_id, prompt_version_id, prompt_version, model, prompt_fingerprint, prompt_snapshot, input_payload, output_payload, used_fallback, fallback_reason, error_message
        ) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12,$13)`,
        [
          id,
          input.task,
          input.promptTemplateId,
          input.promptVersionId,
          input.promptVersion,
          input.model,
          input.promptFingerprint,
          JSON.stringify(input.promptSnapshot),
          JSON.stringify(input.input),
          JSON.stringify(input.output),
          input.usedFallback,
          input.fallbackReason,
          input.errorMessage,
        ],
      );

      return {
        id,
        task: input.task,
        promptTemplateId: input.promptTemplateId,
        promptVersionId: input.promptVersionId,
        promptVersion: input.promptVersion,
        model: input.model,
        promptFingerprint: input.promptFingerprint,
        promptSnapshot: input.promptSnapshot,
        input: input.input,
        output: input.output,
        usedFallback: input.usedFallback,
        fallbackReason: input.fallbackReason,
        errorMessage: input.errorMessage,
        createdAt: new Date().toISOString(),
      };
    },
    async () => updateStore((store) => {
    const record: AiRunRecord = {
      id: `ai-run-${Date.now()}`,
      task: input.task,
      promptTemplateId: input.promptTemplateId,
      promptVersionId: input.promptVersionId,
      promptVersion: input.promptVersion,
      model: input.model,
      promptFingerprint: input.promptFingerprint,
      promptSnapshot: input.promptSnapshot,
      input: input.input,
      output: input.output,
      usedFallback: input.usedFallback,
      fallbackReason: input.fallbackReason,
      errorMessage: input.errorMessage,
      createdAt: new Date().toISOString(),
    };

    store.aiRuns.unshift(record);
    store.aiRuns = store.aiRuns.slice(0, 50);
    return record;
    }),
  );
}

export async function listRecentAiRuns(limit = 10): Promise<AiRunRecord[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select id, task, prompt_template_id, prompt_version_id, prompt_version, model, prompt_fingerprint, prompt_snapshot, input_payload, output_payload, used_fallback, fallback_reason, error_message, created_at
         from ai_runs
         order by created_at desc
         limit $1`,
        [limit],
      );

      return result.rows.map((row) => ({
        id: row.id,
        task: row.task,
        promptTemplateId: row.prompt_template_id,
        promptVersionId: row.prompt_version_id,
        promptVersion: row.prompt_version,
        model: row.model,
        promptFingerprint: row.prompt_fingerprint,
        promptSnapshot: row.prompt_snapshot,
        input: row.input_payload,
        output: row.output_payload,
        usedFallback: row.used_fallback,
        fallbackReason: row.fallback_reason,
        errorMessage: row.error_message,
        createdAt: row.created_at.toISOString(),
      }));
    },
    async () => {
      const store = await readStore();
      return store.aiRuns.slice(0, limit).map((run) => ({
        ...run,
        promptFingerprint:
          run.promptFingerprint ||
          buildPromptFingerprint(run.promptSnapshot?.system ?? "", run.promptSnapshot?.instructions ?? []),
        promptSnapshot: run.promptSnapshot ?? { system: "", instructions: [] },
        fallbackReason: run.fallbackReason ?? null,
      }));
    },
  );
}

export async function getPromptTemplateByTask(task: PromptTask): Promise<PromptTemplate | undefined> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select t.id, t.slug, t.title, t.task, t.description, v.id as active_version_id
         from prompt_templates t
         left join prompt_versions v on v.template_id = t.id and v.is_active = true
         where t.task = $1
         limit 1`,
        [task],
      );
      const row = result.rows[0];
      if (!row) {
        return undefined;
      }
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        task: row.task,
        description: row.description,
        activeVersionId: row.active_version_id,
      };
    },
    async () => {
      const store = await readStore();
      return store.promptTemplates.find((template) => template.task === task);
    },
  );
}

export async function getActivePromptVersionByTask(
  task: PromptTask,
): Promise<ResolvedPromptVersion | undefined> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select
           t.id as template_id, t.slug, t.title, t.task, t.description,
           v.id as version_id, v.version, v.model, v.system_prompt, v.instructions, v.status, v.notes, v.last_eval_run_id, v.last_eval_score, v.updated_at
         from prompt_templates t
         join prompt_versions v on v.template_id = t.id and v.is_active = true
         where t.task = $1
         limit 1`,
        [task],
      );

      const row = result.rows[0];
      if (!row) {
        return undefined;
      }

      return {
        template: {
          id: row.template_id,
          slug: row.slug,
          title: row.title,
          task: row.task,
          description: row.description,
          activeVersionId: row.version_id,
        },
        version: {
          id: row.version_id,
          templateId: row.template_id,
          version: row.version,
          model: row.model,
          systemPrompt: row.system_prompt,
          instructions: row.instructions ?? [],
          status: row.status,
          notes: row.notes,
          lastEvalRunId: row.last_eval_run_id,
          lastEvalScore: row.last_eval_score === null ? null : Number(row.last_eval_score),
          updatedAt: row.updated_at.toISOString(),
        },
      };
    },
    async () => {
      const store = await readStore();
      const template = store.promptTemplates.find((item) => item.task === task);
      if (!template) {
        return undefined;
      }

      const version = store.promptVersions.find((item) => item.id === template.activeVersionId);
      if (!version) {
        return undefined;
      }

      return { template, version: normalizePromptVersion(version, task) };
    },
  );
}

export async function getPromptVersionById(
  promptVersionId: string,
): Promise<ResolvedPromptVersion | undefined> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select
           t.id as template_id, t.slug, t.title, t.task, t.description,
           v.id as version_id, v.version, v.model, v.system_prompt, v.instructions, v.status, v.notes, v.last_eval_run_id, v.last_eval_score, v.updated_at, v.is_active
         from prompt_versions v
         join prompt_templates t on t.id = v.template_id
         where v.id = $1
         limit 1`,
        [promptVersionId],
      );
      const row = result.rows[0];
      if (!row) {
        return undefined;
      }
      return {
        template: {
          id: row.template_id,
          slug: row.slug,
          title: row.title,
          task: row.task,
          description: row.description,
          activeVersionId: row.is_active ? row.version_id : "",
        },
        version: {
          id: row.version_id,
          templateId: row.template_id,
          version: row.version,
          model: row.model,
          systemPrompt: row.system_prompt,
          instructions: row.instructions ?? [],
          status: row.status,
          notes: row.notes,
          lastEvalRunId: row.last_eval_run_id,
          lastEvalScore: row.last_eval_score === null ? null : Number(row.last_eval_score),
          updatedAt: row.updated_at.toISOString(),
        },
      };
    },
    async () => {
      const store = await readStore();
      const version = store.promptVersions.find((item) => item.id === promptVersionId);
      if (!version) {
        return undefined;
      }

      const template = store.promptTemplates.find((item) => item.id === version.templateId);
      if (!template) {
        return undefined;
      }

      return { template, version: normalizePromptVersion(version, template.task) };
    },
  );
}

export async function createEvalRun(input: {
  evalSetId: string;
  evalSetName: string;
  task: PromptTask;
  promptVersionId: string;
  promptVersion: number;
  score: number;
  thresholdPassed: boolean;
  results: EvalRunRecord["results"];
}): Promise<EvalRunRecord> {
  return withFallback(
    async (pool) => {
      const id = randomUUID();
      await pool.query(
        `insert into eval_runs (
          id, eval_set_id, prompt_version_id, score, result_summary
        ) values ($1,$2,$3,$4,$5::jsonb)`,
        [
          id,
          input.evalSetId,
          input.promptVersionId,
          input.score,
          JSON.stringify({ results: input.results, thresholdPassed: input.thresholdPassed }),
        ],
      );

      return {
        id,
        evalSetId: input.evalSetId,
        evalSetName: input.evalSetName,
        task: input.task,
        promptVersionId: input.promptVersionId,
        promptVersion: input.promptVersion,
        score: input.score,
        thresholdPassed: input.thresholdPassed,
        results: input.results,
        createdAt: new Date().toISOString(),
      };
    },
    async () => updateStore((store) => {
    const record: EvalRunRecord = {
      id: `eval-run-${Date.now()}`,
      evalSetId: input.evalSetId,
      evalSetName: input.evalSetName,
      task: input.task,
      promptVersionId: input.promptVersionId,
      promptVersion: input.promptVersion,
      score: input.score,
      thresholdPassed: input.thresholdPassed,
      results: input.results,
      createdAt: new Date().toISOString(),
    };

    store.evalRuns.unshift(record);
    store.evalRuns = store.evalRuns.slice(0, 20);
    return record;
    }),
  );
}

export async function listRecentEvalRuns(limit = 6): Promise<EvalRunRecord[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select r.id, r.eval_set_id, e.name as eval_set_name, e.task, r.prompt_version_id, v.version as prompt_version,
                r.score, r.result_summary, r.executed_at
         from eval_runs r
         join eval_sets e on e.id = r.eval_set_id
         join prompt_versions v on v.id = r.prompt_version_id
         order by r.executed_at desc
         limit $1`,
        [limit],
      );

      return result.rows.map((row) => ({
        id: row.id,
        evalSetId: row.eval_set_id,
        evalSetName: row.eval_set_name,
        task: row.task,
        promptVersionId: row.prompt_version_id,
        promptVersion: row.prompt_version,
        score: Number(row.score),
        thresholdPassed: Boolean(row.result_summary?.thresholdPassed),
        results: row.result_summary?.results ?? [],
        createdAt: row.executed_at.toISOString(),
      }));
    },
    async () => {
      const store = await readStore();
      return store.evalRuns.slice(0, limit);
    },
  );
}

export async function createMediaScriptRecord(input: {
  contentId: string;
  contentSlug: string;
  title: string;
  narration: string;
  scenePlan: MediaScriptRecord["scenePlan"];
  youtubeMetadata: MediaScriptRecord["youtubeMetadata"];
}): Promise<MediaScriptRecord> {
  return withFallback(
    async (pool) => {
      const id = randomUUID();
      await pool.query(
        `insert into media_scripts (
          id, content_id, status, narration, scene_plan, youtube_metadata
        ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
        [id, input.contentId, "draft", input.narration, JSON.stringify(input.scenePlan), JSON.stringify(input.youtubeMetadata)],
      );

      return {
        id,
        contentId: input.contentId,
        contentSlug: input.contentSlug,
        title: input.title,
        status: "draft",
        narration: input.narration,
        scenePlan: input.scenePlan,
        youtubeMetadata: input.youtubeMetadata,
        createdAt: new Date().toISOString(),
      };
    },
    async () =>
      updateStore((store) => {
        const record: MediaScriptRecord = {
          id: randomUUID(),
          contentId: input.contentId,
          contentSlug: input.contentSlug,
          title: input.title,
          status: "draft",
          narration: input.narration,
          scenePlan: input.scenePlan,
          youtubeMetadata: input.youtubeMetadata,
          createdAt: new Date().toISOString(),
        };
        store.mediaScripts.unshift(record);
        store.mediaScripts = store.mediaScripts.slice(0, 20);
        return record;
      }),
  );
}

export async function listRecentMediaScripts(limit = 10): Promise<MediaScriptRecord[]> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `select m.id, m.content_id, c.slug as content_slug, c.title, m.status, m.narration, m.scene_plan, m.youtube_metadata, m.created_at
         from media_scripts m
         join contents c on c.id = m.content_id
         order by m.created_at desc
         limit $1`,
        [limit],
      );

      return result.rows.map((row) => ({
        id: row.id,
        contentId: row.content_id,
        contentSlug: row.content_slug,
        title: row.title,
        status: row.status,
        narration: row.narration,
        scenePlan: row.scene_plan,
        youtubeMetadata: row.youtube_metadata,
        createdAt: row.created_at.toISOString(),
      }));
    },
    async () => {
      const store = await readStore();
      return store.mediaScripts.slice(0, limit);
    },
  );
}

export async function attachEvalRunToPromptVersion(input: {
  promptVersionId: string;
  evalRunId: string;
  score: number;
  thresholdPassed: boolean;
}): Promise<PromptVersion> {
  return withFallback(
    async (pool) => {
      const result = await pool.query(
        `update prompt_versions
         set last_eval_run_id = $2,
             last_eval_score = $3,
             status = $4,
             updated_at = now()
         where id = $1
         returning id, template_id, version, model, system_prompt, instructions, status, notes, last_eval_run_id, last_eval_score, updated_at`,
        [input.promptVersionId, input.evalRunId, input.score, input.thresholdPassed ? "evaluated" : "draft"],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error("Prompt version not found");
      }
      return {
        id: row.id,
        templateId: row.template_id,
        version: row.version,
        model: row.model,
        systemPrompt: row.system_prompt,
        instructions: row.instructions ?? [],
        status: row.status,
        notes: row.notes,
        lastEvalRunId: row.last_eval_run_id,
        lastEvalScore: row.last_eval_score === null ? null : Number(row.last_eval_score),
        updatedAt: row.updated_at.toISOString(),
      };
    },
    async () =>
      updateStore((store) => {
        const version = store.promptVersions.find((item) => item.id === input.promptVersionId);
        if (!version) {
          throw new Error("Prompt version not found");
        }

        version.lastEvalRunId = input.evalRunId;
        version.lastEvalScore = input.score;
        version.status = input.thresholdPassed ? "evaluated" : "draft";
        version.updatedAt = new Date().toISOString();
        const template = store.promptTemplates.find((item) => item.id === version.templateId);
        return normalizePromptVersion(version, template?.task ?? "correction");
      }),
  );
}

export async function activatePromptVersion(promptVersionId: string): Promise<PromptTemplate> {
  return withFallback(
    async (pool) => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const versionResult = await client.query(
          `select id, template_id, status, last_eval_run_id, last_eval_score
           from prompt_versions
           where id = $1
           limit 1`,
          [promptVersionId],
        );
        const version = versionResult.rows[0];
        if (!version) {
          throw new Error("Prompt version not found");
        }

        if (version.last_eval_run_id === null || version.last_eval_score === null || version.status !== "evaluated") {
          throw new Error("Prompt version cannot be activated before passing eval");
        }

        await client.query(
          `update prompt_versions
           set is_active = false,
               status = case when id = $2 then 'active' else 'archived' end,
               updated_at = now()
           where template_id = $1`,
          [version.template_id, promptVersionId],
        );
        await client.query(`update prompt_versions set is_active = true where id = $1`, [promptVersionId]);
        const templateResult = await client.query(
          `select id, slug, title, task, description
           from prompt_templates
           where id = $1
           limit 1`,
          [version.template_id],
        );
        await client.query("commit");
        const template = templateResult.rows[0];
        return {
          id: template.id,
          slug: template.slug,
          title: template.title,
          task: template.task,
          description: template.description,
          activeVersionId: promptVersionId,
        };
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
    async () =>
      updateStore((store) => {
        const version = store.promptVersions.find((item) => item.id === promptVersionId);
        if (!version) {
          throw new Error("Prompt version not found");
        }

        if (version.lastEvalRunId === null || version.lastEvalScore === null || version.status !== "evaluated") {
          throw new Error("Prompt version cannot be activated before passing eval");
        }

        const template = store.promptTemplates.find((item) => item.id === version.templateId);
        if (!template) {
          throw new Error("Prompt template not found");
        }

        for (const item of store.promptVersions) {
          if (item.templateId === version.templateId && item.id !== version.id && item.status === "active") {
            item.status = "archived";
            item.updatedAt = new Date().toISOString();
          }
        }

        version.status = "active";
        version.updatedAt = new Date().toISOString();
        template.activeVersionId = version.id;
        return template;
      }),
  );
}
