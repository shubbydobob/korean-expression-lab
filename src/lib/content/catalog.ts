import type { EvalSet, ExpressionCard, LessonCard, PromptTemplate } from "@/lib/types";

export const lessons: LessonCard[] = [
  {
    id: "lesson-001",
    slug: "pure-korean-for-daily-speech",
    title: "일상에서 되살리는 순우리말 표현",
    summary: "자주 쓰는 외래어와 번역투를 더 자연스러운 우리말로 바꾸는 입문 수업.",
    audience: "both",
    status: "published",
    topicTags: ["순우리말", "대화", "표현"],
    difficulty: 1,
    focus: "빌리다, 다듬다, 나누다 같은 쉬운 어휘로 대화 톤을 살린다.",
  },
  {
    id: "lesson-002",
    slug: "contextual-english-for-korean-speakers",
    title: "직역을 줄이는 상황별 영어 표현",
    summary: "한국어식 사고를 영어 문맥에 맞게 조정하는 연습 자료.",
    audience: "korean_english_learner",
    status: "published",
    topicTags: ["영어표현", "상황학습", "번역투"],
    difficulty: 2,
    focus: "사과, 제안, 부탁 문장을 상황에 맞는 자연스러운 영어로 다듬는다.",
  },
  {
    id: "lesson-003",
    slug: "reading-clarity-for-korean-learners",
    title: "한국어 학습자를 위한 짧은 글 독해 훈련",
    summary: "문장 구조를 끊어 읽고 핵심 정보를 찾는 독해 훈련.",
    audience: "foreign_learner",
    status: "reviewed",
    topicTags: ["독해", "한국어", "학습자료"],
    difficulty: 2,
    focus: "지시어, 연결 표현, 핵심 어휘를 중심으로 짧은 글을 읽는다.",
  },
];

export const expressions: ExpressionCard[] = [
  {
    id: "expr-001",
    phrase: "마음에 새기다",
    translation: "keep it in mind",
    context: "조언이나 가르침을 오래 기억하고 실천할 때",
    nuance: "단순 기억보다 더 깊게 받아들인다는 느낌이 있다.",
  },
  {
    id: "expr-002",
    phrase: "Could you walk me through it?",
    translation: "차근차근 설명해 주실 수 있나요?",
    context: "업무나 학습 상황에서 절차를 설명해 달라고 요청할 때",
    nuance: "명령조가 아니라 협조를 구하는 부드러운 표현이다.",
  },
  {
    id: "expr-003",
    phrase: "한숨 돌리다",
    translation: "take a breather",
    context: "바쁜 일을 잠시 마치고 쉬는 순간",
    nuance: "긴장이나 부담이 잠시 풀리는 감각이 있다.",
  },
];

export const promptTemplates: PromptTemplate[] = [
  {
    id: "prompt-001",
    slug: "correction-structured",
    title: "맞춤법·문맥 교정",
    task: "correction",
    description: "문장 교정과 설명, 대안 표현을 구조화해 반환한다.",
    activeVersion: 3,
    model: "gpt-5.4-mini",
  },
  {
    id: "prompt-002",
    slug: "lesson-generator",
    title: "학습자료 초안 생성",
    task: "lesson_generation",
    description: "대상 학습자와 난이도에 맞는 초안 구조를 만든다.",
    activeVersion: 2,
    model: "gpt-5.4-mini",
  },
  {
    id: "prompt-003",
    slug: "video-script-generator",
    title: "영상 스크립트 생성",
    task: "video_script_generation",
    description: "발행된 콘텐츠를 짧은 영상용 스크립트와 장면 계획으로 변환한다.",
    activeVersion: 1,
    model: "gpt-5.4-mini",
  },
];

export const evalSets: EvalSet[] = [
  {
    id: "eval-001",
    task: "correction",
    name: "기본 교정 품질",
    description: "맞춤법, 문맥, 어조, 설명의 명확성을 확인한다.",
    scoreThreshold: 84,
    cases: [
      {
        id: "case-1",
        input: "내일 회의 자료를 체크 부탁드릴께요.",
        expectedFocus: "맞춤법과 공손한 표현",
      },
      {
        id: "case-2",
        input: "I will explain you this issue tomorrow.",
        expectedFocus: "영어 동사 목적어 구조 교정",
      },
    ],
  },
  {
    id: "eval-002",
    task: "lesson_generation",
    name: "수업 초안 일관성",
    description: "학습 목표, 예시, 연습문항의 연결성을 확인한다.",
    scoreThreshold: 80,
    cases: [
      {
        id: "lesson-case-1",
        input: "외국인을 위한 순우리말 일상 표현 수업",
        expectedFocus: "쉬운 난이도와 명확한 예시",
      },
    ],
  },
];
