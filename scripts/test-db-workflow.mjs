import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { randomUUID } from "node:crypto";

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

async function testPromptActivationGate(client) {
  const candidateVersionId = "44444444-4444-4444-4444-444444444004";
  const templateId = "33333333-3333-3333-3333-333333333001";
  const evalSetId = "55555555-5555-5555-5555-555555555001";

  const before = await client.query(
    `select status, last_eval_run_id, last_eval_score
     from prompt_versions
     where id = $1`,
    [candidateVersionId],
  );
  assert(before.rowCount === 1, "Candidate prompt version should exist");
  assert(before.rows[0].status === "draft", "Candidate prompt version should start as draft");
  assert(before.rows[0].last_eval_run_id === null, "Candidate prompt version should start without eval");

  const evalRunId = randomUUID();
  await client.query(
    `insert into eval_runs (id, eval_set_id, prompt_version_id, score, result_summary)
     values ($1,$2,$3,$4,$5::jsonb)`,
    [evalRunId, evalSetId, candidateVersionId, 100, JSON.stringify({ results: [], thresholdPassed: true })],
  );

  await client.query(
    `update prompt_versions
     set last_eval_run_id = $2,
         last_eval_score = 100,
         status = 'evaluated',
         updated_at = now()
     where id = $1`,
    [candidateVersionId, evalRunId],
  );

  await client.query(
    `update prompt_versions
     set is_active = false,
         status = case when id = $2 then 'active' else 'archived' end,
         updated_at = now()
     where template_id = $1`,
    [templateId, candidateVersionId],
  );
  await client.query(`update prompt_templates set id = id where id = $1`, [templateId]);
  await client.query(`update prompt_versions set is_active = true where id = $1`, [candidateVersionId]);

  const active = await client.query(
    `select id, is_active, status
     from prompt_versions
     where template_id = $1
     order by version desc`,
    [templateId],
  );
  const activeVersions = active.rows.filter((row) => row.is_active);

  assert(activeVersions.length === 1, "Exactly one prompt version should be active per template");
  assert(activeVersions[0].id === candidateVersionId, "Candidate prompt version should become active after eval");
  assert(activeVersions[0].status === "active", "Active prompt version should have active status");
}

async function testReviewPublicationFlow(client) {
  const lessonId = "11111111-1111-1111-1111-111111111003";

  await client.query(`update contents set status = 'draft', updated_at = now() where id = $1`, [lessonId]);
  await client.query(`update contents set status = 'reviewed', updated_at = now() where id = $1`, [lessonId]);
  await client.query(`update contents set status = 'published', updated_at = now() where id = $1`, [lessonId]);

  const published = await client.query(
    `select id, status
     from contents
     where id = $1 and status = 'published'`,
    [lessonId],
  );

  assert(published.rowCount === 1, "Reviewed content should be publishable through the allowed flow");
}

async function main() {
  await loadEnvFile();
  const databaseUrl = process.env.DATABASE_URL;
  assert(databaseUrl, "DATABASE_URL is required for DB workflow tests");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("begin");
    await testPromptActivationGate(client);
    await testReviewPublicationFlow(client);
    await client.query("rollback");
    console.log("DB workflow integration test passed");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

await main();
