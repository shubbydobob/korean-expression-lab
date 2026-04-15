import { callOpenAiJson } from "@/lib/ai/client";
import {
  correctionRequestSchema,
  correctionResponseSchema,
  lessonDraftRequestSchema,
  lessonDraftResponseSchema,
  responseFormatByTask,
  videoScriptRequestSchema,
  videoScriptResponseSchema,
} from "@/lib/ai/schemas";
import {
  createAiRun,
  getActivePromptVersionByTask,
  getPromptVersionById,
} from "@/lib/content/repository";
import type { CorrectionResult, EvalSet, PromptTask, VideoScript } from "@/lib/types";

type SupportedTask = Extract<PromptTask, "correction" | "lesson_generation" | "video_script_generation">;

type PromptContext = Awaited<ReturnType<typeof getActivePromptVersionByTask>>;

function buildUserPayload(task: string, input: unknown, instructions: string[]) {
  return JSON.stringify({ task, instructions, input }, null, 2);
}

function buildPromptFingerprint(systemPrompt: string, instructions: string[]) {
  return JSON.stringify({ systemPrompt, instructions });
}

function fallbackCorrection(text: string): CorrectionResult {
  const corrected = text
    .replace("체크", "확인")
    .replace("explain you", "explain this to you");

  return {
    original: text,
    corrected,
    summary: "기본 교정 규칙을 적용해 문장을 조금 더 자연스럽고 분명하게 다듬었습니다.",
    notes: [
      "의미는 유지하면서 일상적으로 더 많이 쓰는 표현으로 바꿨습니다.",
      "영어 문장이라면 동사와 목적어 구조가 맞도록 기본 교정을 적용했습니다.",
    ],
    alternatives: ["내일 회의 자료를 한 번 더 확인 부탁드릴게요.", "I will explain this issue to you tomorrow."],
  };
}

async function resolvePromptContext(task: SupportedTask, promptVersionId?: string) {
  const activePrompt = promptVersionId ? await getPromptVersionById(promptVersionId) : await getActivePromptVersionByTask(task);

  if (!activePrompt) {
    throw new Error(`No prompt version is configured for task: ${task}`);
  }

  if (activePrompt.template.task !== task) {
    throw new Error(`Prompt version task mismatch for ${task}`);
  }

  return activePrompt;
}

async function trackAiRun(input: {
  prompt: NonNullable<PromptContext>;
  task: PromptTask;
  payload: unknown;
  output: unknown;
  usedFallback: boolean;
  fallbackReason: string | null;
  errorMessage: string | null;
}) {
  await createAiRun({
    task: input.task,
    promptTemplateId: input.prompt.template.id,
    promptVersionId: input.prompt.version.id,
    promptVersion: input.prompt.version.version,
    model: input.prompt.version.model,
    promptFingerprint: buildPromptFingerprint(
      input.prompt.version.systemPrompt,
      input.prompt.version.instructions,
    ),
    promptSnapshot: {
      system: input.prompt.version.systemPrompt,
      instructions: input.prompt.version.instructions,
    },
    input: input.payload,
    output: input.output,
    usedFallback: input.usedFallback,
    fallbackReason: input.fallbackReason,
    errorMessage: input.errorMessage,
  });
}

async function runStructuredTask<TInput, TOutput>(input: {
  task: SupportedTask;
  payload: TInput;
  parseOutput: (raw: string) => TOutput;
  fallback: TOutput;
  promptVersionId?: string;
}) {
  const prompt = await resolvePromptContext(input.task, input.promptVersionId);

  try {
    const raw = await callOpenAiJson({
      model: prompt.version.model,
      output: responseFormatByTask[input.task],
      messages: [
        { role: "system", content: prompt.version.systemPrompt },
        {
          role: "user",
          content: buildUserPayload(input.task, input.payload, prompt.version.instructions),
        },
      ],
    });

    if (!raw) {
      await trackAiRun({
        prompt,
        task: input.task,
        payload: input.payload,
        output: input.fallback,
        usedFallback: true,
        fallbackReason: "missing_api_key_or_empty_response",
        errorMessage: "OpenAI structured response unavailable",
      });
      return input.fallback;
    }

    const result = input.parseOutput(raw);
    await trackAiRun({
      prompt,
      task: input.task,
      payload: input.payload,
      output: result,
      usedFallback: false,
      fallbackReason: null,
      errorMessage: null,
    });
    return result;
  } catch (error) {
    await trackAiRun({
      prompt,
      task: input.task,
      payload: input.payload,
      output: input.fallback,
      usedFallback: true,
      fallbackReason: "request_or_schema_failure",
      errorMessage: error instanceof Error ? error.message : `${input.task} failed`,
    });
    return input.fallback;
  }
}

export async function runCorrection(input: unknown, options?: { promptVersionId?: string }) {
  const parsed = correctionRequestSchema.parse(input);
  return runStructuredTask({
    task: "correction",
    payload: parsed,
    fallback: fallbackCorrection(parsed.text),
    parseOutput: (raw) => correctionResponseSchema.parse(JSON.parse(raw)),
    promptVersionId: options?.promptVersionId,
  });
}

export async function generateLessonDraft(input: unknown, options?: { promptVersionId?: string }) {
  const parsed = lessonDraftRequestSchema.parse(input);
  const fallback = {
    title: `${parsed.topic} 학습 초안`,
    summary: `${parsed.topic}를 ${parsed.audience} 대상에 맞게 설명하는 기본 초안입니다.`,
    objectives: [
      "핵심 표현이나 구조를 이해합니다.",
      "상황에 맞는 예문을 보고 직접 적용해 봅니다.",
    ],
    exampleSentences: [
      "오늘은 대표 표현 몇 가지를 실제 장면과 함께 살펴봅니다.",
      "직역보다 장면에 맞는 자연스러운 표현을 고르는 연습을 합니다.",
    ],
    exercises: [
      "제시된 문장을 더 자연스럽게 바꿔 보세요.",
      "주어진 표현으로 짧은 대화를 만들어 보세요.",
    ],
  };
  return runStructuredTask({
    task: "lesson_generation",
    payload: parsed,
    fallback,
    parseOutput: (raw) => lessonDraftResponseSchema.parse(JSON.parse(raw)),
    promptVersionId: options?.promptVersionId,
  });
}

export async function generateVideoScript(input: unknown, options?: { promptVersionId?: string }): Promise<VideoScript> {
  const parsed = videoScriptRequestSchema.parse(input);
  const fallback: VideoScript = {
    title: parsed.title,
    hook: "말을 조금만 바꿔도 훨씬 더 자연스럽게 들릴 수 있습니다.",
    narration: `${parsed.summary} ${parsed.focus}를 중심으로 짧고 또렷한 메시지로 구성했습니다.`,
    scenes: [
      {
        heading: "문제 제시",
        visualPrompt: "Warm editorial Korean study desk, bold text cards, modern educational motion graphics",
        captions: ["익숙한 표현인데 어딘가 어색합니다.", "맥락에 맞는 말의 결이 중요합니다."],
      },
      {
        heading: "교정 예시",
        visualPrompt: "Split screen before and after phrasing comparison, calm beige and green palette",
        captions: ["어색한 표현", "자연스러운 표현", "왜 바꾸는지 짧게 설명"],
      },
      {
        heading: "실전 적용",
        visualPrompt: "Short conversational scene, Korean learner notebook, accessible infographic style",
        captions: ["방금 배운 문장을 직접 바꿔 보세요.", "표현 감각은 반복으로 좋아집니다."],
      },
    ],
    youtube: {
      title: `${parsed.title} | 한국어·영어 표현 감각 익히기`,
      description: `${parsed.summary}\n\n핵심 포인트: ${parsed.focus}`,
      tags: ["한국어공부", "영어표현", "표현교정", "AI학습"],
    },
  };
  return runStructuredTask({
    task: "video_script_generation",
    payload: parsed,
    fallback,
    parseOutput: (raw) => videoScriptResponseSchema.parse(JSON.parse(raw)),
    promptVersionId: options?.promptVersionId,
  });
}

function includesAll(text: string, items: string[]) {
  const normalized = text.toLowerCase();
  return items.every((item) => normalized.includes(item.toLowerCase()));
}

function summarizeCheck(name: string, passed: boolean, detail: string) {
  return `${passed ? "PASS" : "FAIL"} ${name}: ${detail}`;
}

export async function runEvalSet(evalSet: EvalSet, options?: { promptVersionId?: string }) {
  const results = await Promise.all(
    evalSet.cases.map(async (item) => {
      if (evalSet.task === "correction") {
        const correction = await runCorrection(
          {
            text: item.input,
            language: item.input.includes("I ") ? "en" : "ko",
          },
          options,
        );

        const checks = [
          {
            name: "expected correction",
            passed: item.expectedCorrection ? correction.corrected === item.expectedCorrection : correction.corrected !== item.input,
            detail: item.expectedCorrection ? correction.corrected : correction.corrected,
          },
          {
            name: "focus coverage",
            passed: includesAll(
              `${correction.summary} ${correction.notes.join(" ")}`,
              item.expectedFocus.split(/\s+/).filter(Boolean).slice(0, 2),
            ),
            detail: item.expectedFocus,
          },
          {
            name: "required notes",
            passed: item.requiredNotes
              ? item.requiredNotes.some((note) => includesAll(correction.notes.join(" "), [note]))
              : correction.notes.length > 0,
            detail: item.requiredNotes?.join(", ") ?? `${correction.notes.length} notes`,
          },
        ];
        const passed = checks.every((check) => check.passed);
        return {
          id: item.id,
          passed,
          summary: checks.map((check) => summarizeCheck(check.name, check.passed, check.detail)).join(" | "),
        };
      }

      if (evalSet.task === "lesson_generation") {
        const lesson = await generateLessonDraft(
          {
            topic: item.input,
            audience: item.audience ?? "both",
            difficulty: item.difficulty ?? 2,
          },
          options,
        );

        const checks = [
          {
            name: "section counts",
            passed:
              lesson.objectives.length >= 2 &&
              lesson.exampleSentences.length >= 2 &&
              lesson.exercises.length >= 2,
            detail: `objectives=${lesson.objectives.length}, examples=${lesson.exampleSentences.length}, exercises=${lesson.exercises.length}`,
          },
          {
            name: "focus coverage",
            passed: includesAll(
              `${lesson.title} ${lesson.summary} ${lesson.objectives.join(" ")}`,
              item.expectedFocus.split(/\s+/).filter(Boolean).slice(0, 2),
            ),
            detail: item.expectedFocus,
          },
          {
            name: "expected sections",
            passed: item.expectedSections
              ? includesAll(`${lesson.objectives.join(" ")} ${lesson.exercises.join(" ")}`, item.expectedSections)
              : true,
            detail: item.expectedSections?.join(", ") ?? "default lesson coverage",
          },
        ];
        const passed = checks.every((check) => check.passed);
        return {
          id: item.id,
          passed,
          summary: checks.map((check) => summarizeCheck(check.name, check.passed, check.detail)).join(" | "),
        };
      }

      const script = await generateVideoScript(
        {
          title: item.input,
          summary: item.expectedFocus,
          focus: item.expectedFocus,
        },
        options,
      );

      const checks = [
        {
          name: "scene count",
          passed: script.scenes.length >= 3,
          detail: `${script.scenes.length} scenes`,
        },
        {
          name: "focus coverage",
          passed: includesAll(
            `${script.hook} ${script.narration} ${script.youtube.description}`,
            item.expectedFocus.split(/\s+/).filter(Boolean).slice(0, 2),
          ),
          detail: item.expectedFocus,
        },
        {
          name: "metadata tags",
          passed: item.expectedTags ? includesAll(script.youtube.tags.join(" "), item.expectedTags) : script.youtube.tags.length >= 2,
          detail: item.expectedTags?.join(", ") ?? `${script.youtube.tags.length} tags`,
        },
      ];
      const passed = checks.every((check) => check.passed);
      return {
        id: item.id,
        passed,
        summary: checks.map((check) => summarizeCheck(check.name, check.passed, check.detail)).join(" | "),
      };
    }),
  );

  const passed = results.filter((result) => result.passed).length;
  const score = Math.round((passed / results.length) * 100);

  return {
    score,
    thresholdPassed: score >= evalSet.scoreThreshold,
    results,
  };
}
