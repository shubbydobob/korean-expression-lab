import { readFile } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();

async function readText(relativePath) {
  return readFile(path.join(cwd, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function matchTasks(source) {
  const matches = [...source.matchAll(/^\s{2}([a-z_]+):\s*\{/gm)];
  return new Set(matches.map((match) => match[1]));
}

async function main() {
  const [promptsSource, schemasSource, harnessSource, repositorySource, storeSource] = await Promise.all([
    readText("src/lib/ai/prompts.ts"),
    readText("src/lib/ai/schemas.ts"),
    readText("src/lib/ai/harness.ts"),
    readText("src/lib/content/repository.ts"),
    readText("src/lib/content/store.json"),
  ]);

  const store = JSON.parse(storeSource);
  const promptTasks = matchTasks(promptsSource);
  const expectedTaskConfigs = ["correction", "lesson_generation", "video_script_generation"];

  for (const task of expectedTaskConfigs) {
    assert(promptTasks.has(task), `Missing prompt config for task: ${task}`);
  }

  assert(schemasSource.includes("correctionRequestSchema"), "Missing correction request schema");
  assert(schemasSource.includes("correctionResponseSchema"), "Missing correction response schema");
  assert(schemasSource.includes("lessonDraftRequestSchema"), "Missing lesson draft request schema");
  assert(schemasSource.includes("lessonDraftResponseSchema"), "Missing lesson draft response schema");
  assert(schemasSource.includes("videoScriptRequestSchema"), "Missing video script request schema");
  assert(schemasSource.includes("videoScriptResponseSchema"), "Missing video script response schema");

  assert(harnessSource.includes("runStructuredTask"), "Harness should use the shared structured task runner");
  assert(harnessSource.includes("trackAiRun"), "Harness should track AI executions");
  assert(harnessSource.includes("resolvePromptContext"), "Harness should resolve the selected prompt version");
  assert(harnessSource.includes("promptVersionId"), "Harness should support explicit prompt version execution");
  assert(repositorySource.includes("const TRANSITIONS"), "Repository should declare review state transitions");
  assert(repositorySource.includes("createEvalRun"), "Repository should persist eval runs");
  assert(repositorySource.includes("createAiRun"), "Repository should persist AI runs");
  assert(repositorySource.includes("activatePromptVersion"), "Repository should support prompt activation");
  assert(repositorySource.includes("systemPrompt"), "Prompt versions should carry runtime prompt bodies");
  assert(repositorySource.includes("instructions"), "Prompt versions should carry runtime instructions");
  assert(
    repositorySource.includes("cannot be activated before passing eval"),
    "Repository should gate prompt activation on eval success",
  );

  const validStatuses = new Set(["draft", "reviewed", "published", "archived"]);
  const validPromptStatuses = new Set(["draft", "evaluated", "active", "archived"]);
  assert(Array.isArray(store.lessons), "Store must contain lessons");
  assert(Array.isArray(store.promptTemplates), "Store must contain promptTemplates");
  assert(Array.isArray(store.promptVersions), "Store must contain promptVersions");
  assert(Array.isArray(store.evalSets), "Store must contain eval sets");
  assert(Array.isArray(store.aiRuns), "Store must contain aiRuns");
  assert(Array.isArray(store.evalRuns), "Store must contain evalRuns");

  for (const lesson of store.lessons) {
    assert(validStatuses.has(lesson.status), `Invalid lesson status: ${lesson.status}`);
    assert(typeof lesson.slug === "string" && lesson.slug.length > 0, "Lesson slug must be present");
  }

  for (const evalSet of store.evalSets) {
    assert(evalSet.scoreThreshold >= 0 && evalSet.scoreThreshold <= 100, `Invalid eval threshold: ${evalSet.id}`);
    assert(Array.isArray(evalSet.cases) && evalSet.cases.length > 0, `Eval set must have cases: ${evalSet.id}`);
  }

  const promptVersionIds = new Set(store.promptVersions.map((version) => version.id));
  const activeCounts = new Map();

  for (const template of store.promptTemplates) {
    assert(promptVersionIds.has(template.activeVersionId), `Template activeVersionId must exist: ${template.id}`);
  }

  for (const version of store.promptVersions) {
    assert(validPromptStatuses.has(version.status), `Invalid prompt version status: ${version.id}`);
    assert(typeof version.systemPrompt === "string" && version.systemPrompt.length > 0, `Prompt version missing systemPrompt: ${version.id}`);
    assert(Array.isArray(version.instructions) && version.instructions.length > 0, `Prompt version missing instructions: ${version.id}`);
    activeCounts.set(version.templateId, (activeCounts.get(version.templateId) || 0) + (version.status === "active" ? 1 : 0));
    if (version.status === "active") {
      assert(
        store.promptTemplates.some((template) => template.activeVersionId === version.id),
        `Active prompt version must be referenced by a template: ${version.id}`,
      );
    }
  }

  for (const run of store.aiRuns) {
    assert(typeof run.promptFingerprint === "string" && run.promptFingerprint.length > 0, `AI run missing prompt fingerprint: ${run.id}`);
    assert(run.promptSnapshot && typeof run.promptSnapshot.system === "string", `AI run missing prompt snapshot: ${run.id}`);
  }

  for (const [templateId, count] of activeCounts.entries()) {
    assert(count <= 1, `Only one active prompt version is allowed per template: ${templateId}`);
  }

  console.log("Harness validation passed");
}

await main();
