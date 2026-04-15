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

async function main() {
  await loadEnvFile();
  const databaseUrl = process.env.DATABASE_URL;
  assert(databaseUrl, "DATABASE_URL is required for Postgres verification");

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const checks = [];
    checks.push(await client.query("select count(*)::int as count from prompt_templates"));
    checks.push(await client.query("select count(*)::int as count from prompt_versions"));
    checks.push(await client.query("select count(*)::int as count from contents"));
    checks.push(await client.query("select count(*)::int as count from eval_sets"));
    checks.push(await client.query("select count(*)::int as count from prompt_versions where is_active = true"));

    assert(checks[0].rows[0].count > 0, "prompt_templates should not be empty");
    assert(checks[1].rows[0].count > 0, "prompt_versions should not be empty");
    assert(checks[2].rows[0].count > 0, "contents should not be empty");
    assert(checks[3].rows[0].count > 0, "eval_sets should not be empty");
    assert(checks[4].rows[0].count > 0, "at least one active prompt version should exist");

    const invalidActivation = await client.query(
      `select count(*)::int as count
       from prompt_versions
       where is_active = true and status <> 'active'`,
    );
    assert(invalidActivation.rows[0].count === 0, "active prompt versions must have active status");

    console.log("Postgres verification passed");
  } finally {
    await client.end();
  }
}

await main();
