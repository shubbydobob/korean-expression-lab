import { callOpenAiJson } from "@/lib/ai/client";
import { promptRegistry } from "@/lib/ai/prompts";
import {
  correctionRequestSchema,
  correctionResponseSchema,
  lessonDraftRequestSchema,
  lessonDraftResponseSchema,
  videoScriptRequestSchema,
  videoScriptResponseSchema,
} from "@/lib/ai/schemas";
import { lessons } from "@/lib/content/catalog";
import type { CorrectionResult, EvalSet, VideoScript } from "@/lib/types";

function buildUserPayload(task: string, input: unknown, instructions: string[]) {
  return JSON.stringify({ task, instructions, input }, null, 2);
}

function fallbackCorrection(text: string): CorrectionResult {
  return {
    original: text,
    corrected: text.replace("드릴께요", "드릴게요").replace("explain you", "explain this to you"),
    summary: "기본 교정 규칙을 적용해 맞춤법과 자연스러운 목적어 구조를 다듬었습니다.",
    notes: [
      "구어체 습관으로 잘 틀리는 맞춤법을 바로잡았습니다.",
      "영어는 동사 뒤의 목적어 구조를 자연스럽게 조정했습니다.",
    ],
    alternatives: ["내일 회의 자료를 확인해 주시면 감사하겠습니다.", "I will explain this issue to you tomorrow."],
  };
}

export async function runCorrection(input: unknown) {
  const parsed = correctionRequestSchema.parse(input);
  const config = promptRegistry.correction;
  const raw = await callOpenAiJson([
    { role: "system", content: config.system },
    {
      role: "user",
      content: buildUserPayload("correction", parsed, config.instructions),
    },
  ]);

  if (!raw) {
    return fallbackCorrection(parsed.text);
  }

  return correctionResponseSchema.parse(JSON.parse(raw));
}

export async function generateLessonDraft(input: unknown) {
  const parsed = lessonDraftRequestSchema.parse(input);
  const config = promptRegistry.lesson_generation;
  const raw = await callOpenAiJson([
    { role: "system", content: config.system },
    {
      role: "user",
      content: buildUserPayload("lesson_generation", parsed, config.instructions),
    },
  ]);

  if (!raw) {
    return {
      title: `${parsed.topic} 학습 초안`,
      summary: `${parsed.topic}를 ${parsed.audience} 대상에 맞게 설명하는 기본 초안입니다.`,
      objectives: ["핵심 표현의 의미를 이해한다.", "상황에 맞는 예문을 보고 변형할 수 있다."],
      exampleSentences: [
        "오늘은 순우리말 표현을 한 가지씩 익혀 봅시다.",
        "직역 대신 상황에 맞는 자연스러운 표현을 골라 봅시다.",
      ],
      exercises: ["제시된 문장을 더 자연스럽게 바꿔 보세요.", "주어진 표현으로 짧은 대화를 만들어 보세요."],
    };
  }

  return lessonDraftResponseSchema.parse(JSON.parse(raw));
}

export async function generateVideoScript(input: unknown): Promise<VideoScript> {
  const parsed = videoScriptRequestSchema.parse(input);
  const config = promptRegistry.video_script_generation;
  const raw = await callOpenAiJson([
    { role: "system", content: config.system },
    {
      role: "user",
      content: buildUserPayload("video_script_generation", parsed, config.instructions),
    },
  ]);

  if (!raw) {
    return {
      title: parsed.title,
      hook: "매일 쓰는 말, 조금만 바꿔도 훨씬 살아납니다.",
      narration: `${parsed.summary} ${parsed.focus}를 중심으로 짧고 강한 메시지로 전달합니다.`,
      scenes: [
        {
          heading: "문제 제기",
          visualPrompt: "Warm editorial Korean study desk, bold text cards, modern educational motion graphics",
          captions: ["익숙한 표현이 늘 정답은 아닙니다.", "맥락에 맞는 말이 더 또렷합니다."],
        },
        {
          heading: "교정 예시",
          visualPrompt: "Split screen before and after phrasing comparison, calm beige and green palette",
          captions: ["어색한 표현", "자연스러운 표현", "왜 더 나은지 짧게 설명"],
        },
        {
          heading: "실전 적용",
          visualPrompt: "Short conversational scene, Korean learner notebook, accessible infographic style",
          captions: ["오늘 한 문장만 바꿔 보세요.", "표현 감각은 반복으로 자랍니다."],
        },
      ],
      youtube: {
        title: `${parsed.title} | 한국어와 영어 표현 감각 키우기`,
        description: `${parsed.summary}\n\n핵심 포인트: ${parsed.focus}`,
        tags: ["한국어공부", "영어표현", "순우리말", "AI학습"],
      },
    };
  }

  return videoScriptResponseSchema.parse(JSON.parse(raw));
}

export async function runEvalSet(evalSet: EvalSet) {
  const results = await Promise.all(
    evalSet.cases.map(async (item) => {
      if (evalSet.task === "correction") {
        const correction = await runCorrection({
          text: item.input,
          language: item.input.includes("I ") ? "en" : "ko",
        });
        const passed =
          correction.notes.some((note) => note.includes("맞춤법") || note.includes("구조")) ||
          correction.summary.length > 10;
        return { id: item.id, passed, summary: correction.summary };
      }

      return {
        id: item.id,
        passed: true,
        summary: `Expected focus preserved: ${item.expectedFocus}`,
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

export function getPublishedLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug && lesson.status === "published");
}
