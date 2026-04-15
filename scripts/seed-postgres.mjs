import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const cwd = process.cwd();

async function loadEnvFile() {
  const envPath = path.join(cwd, ".env.local");
  try {
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) {
        continue;
      }
      const index = line.indexOf("=");
      if (index === -1) {
        continue;
      }
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  const file = await readFile(path.join(cwd, relativePath), "utf8");
  return JSON.parse(file);
}

function promptPayloadForTask(task) {
  const prompts = {
    correction: {
      system: "You are a bilingual Korean language educator. Return structured JSON only. Focus on correctness, nuance, and teachability.",
      instructions: [
        "Correct grammar, spelling, and context-sensitive wording.",
        "Explain why the correction is better in short plain language.",
        "Offer alternatives with different tones when useful.",
      ],
    },
    lesson_generation: {
      system: "You are an instructional designer for Korean and English expression learning. Return JSON only.",
      instructions: [
        "Generate a concise, teachable lesson draft.",
        "Keep the examples aligned to the selected audience and difficulty.",
      ],
    },
    video_script_generation: {
      system: "You convert educational content into short-form video scripts and a scene plan. Return JSON only.",
      instructions: [
        "Open with a strong hook.",
        "Keep scenes visually distinct.",
        "Generate metadata ready for YouTube drafting.",
      ],
    },
  };

  return prompts[task] ?? {
    system: "Return JSON only.",
    instructions: [],
  };
}

function schemaPayloadForTask(task) {
  const schemas = {
    correction: {
      input: {
        text: "string",
        language: ["ko", "en"],
        goal: "string",
      },
      output: {
        original: "string",
        corrected: "string",
        summary: "string",
        notes: ["string"],
        alternatives: ["string"],
      },
    },
    lesson_generation: {
      input: {
        topic: "string",
        audience: ["both", "foreign_learner", "korean_english_learner"],
        difficulty: "number",
      },
      output: {
        title: "string",
        summary: "string",
        objectives: ["string"],
        exampleSentences: ["string"],
        exercises: ["string"],
      },
    },
    video_script_generation: {
      input: {
        title: "string",
        summary: "string",
        focus: "string",
      },
      output: {
        title: "string",
        hook: "string",
        narration: "string",
        scenes: [
          {
            heading: "string",
            visualPrompt: "string",
            captions: ["string"],
          },
        ],
        youtube: {
          title: "string",
          description: "string",
          tags: ["string"],
        },
      },
    },
  };

  return schemas[task] ?? { input: {}, output: {} };
}

async function upsertPromptTemplates(client, store) {
  for (const template of store.promptTemplates) {
    const schema = schemaPayloadForTask(template.task);
    await client.query(
      `insert into prompt_templates (id, task, slug, title, description, input_schema, output_schema)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
       on conflict (id) do update
       set task = excluded.task,
           slug = excluded.slug,
           title = excluded.title,
           description = excluded.description,
           input_schema = excluded.input_schema,
           output_schema = excluded.output_schema`,
      [
        template.id,
        template.task,
        template.slug,
        template.title,
        template.description,
        JSON.stringify(schema.input),
        JSON.stringify(schema.output),
      ],
    );
  }
}

async function upsertPromptVersions(client, store) {
  for (const version of store.promptVersions) {
    const template = store.promptTemplates.find((item) => item.id === version.templateId);
    assert(template, `Missing template for prompt version ${version.id}`);
    const promptPayload = promptPayloadForTask(template.task);
    const isActive = template.activeVersionId === version.id;

    await client.query(
      `insert into prompt_versions (
         id, template_id, version, model, system_prompt, instructions, status, notes,
         last_eval_run_id, last_eval_score, is_active, updated_at
       )
       values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,$12)
       on conflict (id) do update
       set template_id = excluded.template_id,
           version = excluded.version,
           model = excluded.model,
           system_prompt = excluded.system_prompt,
           instructions = excluded.instructions,
           status = excluded.status,
           notes = excluded.notes,
           last_eval_run_id = excluded.last_eval_run_id,
           last_eval_score = excluded.last_eval_score,
           is_active = excluded.is_active,
           updated_at = excluded.updated_at`,
      [
        version.id,
        version.templateId,
        version.version,
        version.model,
        promptPayload.system,
        JSON.stringify(promptPayload.instructions),
        version.status,
        version.notes,
        version.lastEvalRunId,
        version.lastEvalScore,
        isActive,
        version.updatedAt,
      ],
    );
  }
}

async function upsertContents(client, store) {
  for (const lesson of store.lessons) {
    await client.query(
      `insert into contents (
         id, slug, title, summary, audience, status, difficulty, topic_tags, body
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       on conflict (id) do update
       set slug = excluded.slug,
           title = excluded.title,
           summary = excluded.summary,
           audience = excluded.audience,
           status = excluded.status,
           difficulty = excluded.difficulty,
           topic_tags = excluded.topic_tags,
           body = excluded.body,
           updated_at = now()`,
      [
        lesson.id,
        lesson.slug,
        lesson.title,
        lesson.summary,
        lesson.audience,
        lesson.status,
        lesson.difficulty,
        lesson.topicTags,
        JSON.stringify({ focus: lesson.focus }),
      ],
    );
  }
}

async function upsertExpressions(client, store) {
  for (const expression of store.expressions) {
    await client.query(
      `insert into expressions (
         id, phrase, language, nuance, context_note, example_sentences
       )
       values ($1,$2,'ko',$3,$4,$5::jsonb)
       on conflict (id) do update
       set phrase = excluded.phrase,
           language = excluded.language,
           nuance = excluded.nuance,
           context_note = excluded.context_note,
           example_sentences = excluded.example_sentences`,
      [
        expression.id,
        expression.phrase,
        expression.nuance,
        expression.context,
        JSON.stringify({ translation: expression.translation }),
      ],
    );
  }
}

async function upsertEvalSets(client, store) {
  for (const evalSet of store.evalSets) {
    await client.query(
      `insert into eval_sets (id, name, task, description, score_threshold, cases)
       values ($1,$2,$3,$4,$5,$6::jsonb)
       on conflict (id) do update
       set name = excluded.name,
           task = excluded.task,
           description = excluded.description,
           score_threshold = excluded.score_threshold,
           cases = excluded.cases`,
      [evalSet.id, evalSet.name, evalSet.task, evalSet.description, evalSet.scoreThreshold, JSON.stringify(evalSet.cases)],
    );
  }
}

async function resetRuns(client, store) {
  await client.query("delete from ai_runs");
  await client.query("delete from eval_runs");
  await client.query("delete from media_scripts");

  for (const run of store.aiRuns) {
    await client.query(
      `insert into ai_runs (
         id, task, prompt_template_id, prompt_version_id, prompt_version, model, input_payload, output_payload, used_fallback, error_message, created_at
       )
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11)`,
      [
        run.id,
        run.task,
        run.promptTemplateId,
        run.promptVersionId,
        run.promptVersion,
        run.model,
        JSON.stringify(run.input),
        JSON.stringify(run.output),
        run.usedFallback,
        run.errorMessage,
        run.createdAt,
      ],
    );
  }

  for (const run of store.evalRuns) {
    await client.query(
      `insert into eval_runs (id, eval_set_id, prompt_version_id, score, result_summary, executed_at)
       values ($1,$2,$3,$4,$5::jsonb,$6)`,
      [
        run.id,
        run.evalSetId,
        run.promptVersionId,
        run.score,
        JSON.stringify({ results: run.results, thresholdPassed: run.thresholdPassed }),
        run.createdAt,
      ],
    );
  }

  for (const script of store.mediaScripts ?? []) {
    await client.query(
      `insert into media_scripts (id, content_id, status, narration, scene_plan, youtube_metadata, created_at)
       values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)`,
      [
        script.id,
        script.contentId,
        script.status,
        script.narration,
        JSON.stringify(script.scenePlan),
        JSON.stringify(script.youtubeMetadata),
        script.createdAt,
      ],
    );
  }
}

async function main() {
  await loadEnvFile();
  const databaseUrl = process.env.DATABASE_URL;
  assert(databaseUrl, "DATABASE_URL is required for seeding Postgres");

  const store = await readJson("src/lib/content/store.json");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("begin");
    await upsertPromptTemplates(client, store);
    await upsertPromptVersions(client, store);
    await upsertContents(client, store);
    await upsertExpressions(client, store);
    await upsertEvalSets(client, store);
    await resetRuns(client, store);
    await client.query("commit");
    console.log("Postgres seed completed");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

await main();
