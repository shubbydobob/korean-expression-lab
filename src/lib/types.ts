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
  activeVersion: number;
  model: string;
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
