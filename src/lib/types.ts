export type Audience = "both" | "foreign_learner" | "korean_english_learner";
export type ContentStatus = "draft" | "reviewed" | "published" | "archived";
export type PromptTask =
  | "correction"
  | "expression_recommendation"
  | "lesson_generation"
  | "difficulty_adaptation"
  | "reading_quiz_generation"
  | "video_script_generation";

export type LessonCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  audience: Audience;
  status: ContentStatus;
  topicTags: string[];
  difficulty: number;
  focus: string;
};

export type ExpressionCard = {
  id: string;
  phrase: string;
  translation: string;
  context: string;
  nuance: string;
};

export type CorrectionResult = {
  original: string;
  corrected: string;
  summary: string;
  notes: string[];
  alternatives: string[];
};

export type PromptTemplate = {
  id: string;
  slug: string;
  title: string;
  task: PromptTask;
  description: string;
  activeVersionId: string;
};

export type PromptVersionStatus = "draft" | "evaluated" | "active" | "archived";

export type PromptVersion = {
  id: string;
  templateId: string;
  version: number;
  model: string;
  systemPrompt: string;
  instructions: string[];
  status: PromptVersionStatus;
  notes: string;
  lastEvalRunId: string | null;
  lastEvalScore: number | null;
  updatedAt: string;
};

export type EvalSet = {
  id: string;
  task: PromptTask;
  name: string;
  description: string;
  scoreThreshold: number;
  cases: Array<{
    id: string;
    input: string;
    expectedFocus: string;
    expectedCorrection?: string;
    requiredNotes?: string[];
    audience?: Audience;
    difficulty?: number;
    expectedSections?: string[];
    expectedTags?: string[];
  }>;
};

export type VideoScript = {
  title: string;
  hook: string;
  narration: string;
  scenes: Array<{
    heading: string;
    visualPrompt: string;
    captions: string[];
  }>;
  youtube: {
    title: string;
    description: string;
    tags: string[];
  };
};

export type LessonStatusAction = {
  label: string;
  nextStatus: ContentStatus;
};

export type AiRunRecord = {
  id: string;
  task: PromptTask;
  promptTemplateId: string;
  promptVersionId: string;
  promptVersion: number;
  model: string;
  promptFingerprint: string;
  promptSnapshot: {
    system: string;
    instructions: string[];
  };
  input: unknown;
  output: unknown;
  usedFallback: boolean;
  fallbackReason: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export type EvalRunRecord = {
  id: string;
  evalSetId: string;
  evalSetName: string;
  task: PromptTask;
  promptVersionId: string;
  promptVersion: number;
  score: number;
  thresholdPassed: boolean;
  results: Array<{
    id: string;
    passed: boolean;
    summary: string;
  }>;
  createdAt: string;
};

export type MediaScriptRecord = {
  id: string;
  contentId: string;
  contentSlug: string;
  title: string;
  status: string;
  narration: string;
  scenePlan: VideoScript["scenes"];
  youtubeMetadata: VideoScript["youtube"];
  createdAt: string;
};
