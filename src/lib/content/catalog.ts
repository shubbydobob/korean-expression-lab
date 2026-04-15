import type { EvalSet, ExpressionCard, LessonCard, PromptTemplate } from "@/lib/types";

export const lessons: LessonCard[] = [
  {
    id: "11111111-1111-1111-1111-111111111001",
    slug: "pure-korean-for-daily-speech",
    title: "일상에서 되살리는 순우리말 표현",
    summary: "자주 쓰는 번역투 표현을 더 자연스러운 우리말로 바꾸는 입문 수업입니다.",
    audience: "both",
    status: "published",
    topicTags: ["순우리말", "일상", "표현"],
    difficulty: 1,
    focus: "비슷해 보이는 표현을 나누어 보고 실제 대화에서 바로 쓸 수 있도록 익힙니다.",
  },
  {
    id: "11111111-1111-1111-1111-111111111002",
    slug: "contextual-english-for-korean-speakers",
    title: "직역을 줄이고 상황별 영어 표현 익히기",
    summary: "한국어식 사고를 줄이고 영어 문맥에 맞게 표현을 조정하는 학습 자료입니다.",
    audience: "korean_english_learner",
    status: "published",
    topicTags: ["영어표현", "상황학습", "번역투"],
    difficulty: 2,
    focus: "요청, 제안, 사과 문장을 상황에 맞는 자연스러운 영어로 바꿔 봅니다.",
  },
  {
    id: "11111111-1111-1111-1111-111111111003",
    slug: "reading-clarity-for-korean-learners",
    title: "한국어 학습자를 위한 짧은 글 이해 훈련",
    summary: "문장 구조를 따라 읽고 핵심 정보를 찾는 읽기 이해 훈련입니다.",
    audience: "foreign_learner",
    status: "reviewed",
    topicTags: ["읽기이해", "한국어", "학습자료"],
    difficulty: 2,
    focus: "지시어, 연결 표현, 문단의 핵심을 중심으로 짧은 글을 읽는 연습을 합니다.",
  },
];

export const expressions: ExpressionCard[] = [
  {
    id: "22222222-2222-2222-2222-222222222001",
    phrase: "마음에 새기다",
    translation: "keep it in mind",
    context: "조언이나 가르침을 오래 기억하고 실천하고 싶을 때",
    nuance: "단순히 기억하는 것보다 더 깊게 받아들이는 느낌이 있습니다.",
  },
  {
    id: "22222222-2222-2222-2222-222222222002",
    phrase: "Could you walk me through it?",
    translation: "차근차근 설명해 주실 수 있나요?",
    context: "업무나 학습 상황에서 과정을 설명해 달라고 요청할 때",
    nuance: "명령조가 아니라 도움을 구하는 부드러운 표현입니다.",
  },
  {
    id: "22222222-2222-2222-2222-222222222003",
    phrase: "숨을 돌리다",
    translation: "take a breather",
    context: "바쁜 일을 잠시 마치고 쉬는 순간",
    nuance: "긴장이나 부담이 잠시 풀리는 감각을 담고 있습니다.",
  },
];

export const promptTemplates: PromptTemplate[] = [
  {
    id: "33333333-3333-3333-3333-333333333001",
    slug: "correction-structured",
    title: "맞춤법과 문맥 교정",
    task: "correction",
    description: "문장 교정과 설명, 대안 표현을 구조화해 반환합니다.",
    activeVersionId: "44444444-4444-4444-4444-444444444001",
  },
  {
    id: "33333333-3333-3333-3333-333333333002",
    slug: "lesson-generator",
    title: "학습 자료 초안 생성",
    task: "lesson_generation",
    description: "대상과 난이도에 맞는 수업 초안 구조를 생성합니다.",
    activeVersionId: "44444444-4444-4444-4444-444444444002",
  },
  {
    id: "33333333-3333-3333-3333-333333333003",
    slug: "video-script-generator",
    title: "영상 스크립트 생성",
    task: "video_script_generation",
    description: "발행된 콘텐츠를 짧은 영상용 스크립트와 씬 계획으로 변환합니다.",
    activeVersionId: "44444444-4444-4444-4444-444444444003",
  },
];

export const evalSets: EvalSet[] = [
  {
    id: "55555555-5555-5555-5555-555555555001",
    task: "correction",
    name: "기본 교정 정확도",
    description: "맞춤법, 문맥, 설명의 명확성을 함께 확인합니다.",
    scoreThreshold: 84,
    cases: [
      {
        id: "case-1",
        input: "내일 회의 자료를 체크 부탁드릴게요.",
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
    id: "55555555-5555-5555-5555-555555555002",
    task: "lesson_generation",
    name: "수업 초안 일관성",
    description: "학습 목표, 예시, 연습 문항의 연결성을 확인합니다.",
    scoreThreshold: 80,
    cases: [
      {
        id: "lesson-case-1",
        input: "중급자를 위한 순우리말 일상 표현 수업",
        expectedFocus: "수업 사이의 명확한 예시",
      },
    ],
  },
];
