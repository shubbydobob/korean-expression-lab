# Agent Operations

## 목적
- 이 저장소는 순우리말, 한국어/영어 표현, 맞춤법·문법·독해 훈련을 위한 공개 학습 플랫폼을 만든다.
- AI는 단순 생성기가 아니라 통제·평가·검수 가능한 학습 보조 시스템으로 다룬다.
- 기준은 OpenAI 공식 문서의 Prompting, Structured Outputs, Datasets/Evals, Agent evals를 따른다.

## 하네스 엔지니어링
- 프롬프트는 코드에 흩뿌리지 말고 자산으로 관리한다.
- 프롬프트는 태스크별로 분리하고 버전, 입력 구조, 출력 구조, 지시사항을 함께 기록한다.
- 주요 태스크 최소 단위는 `correction`, `expression_recommendation`, `lesson_generation`, `difficulty_adaptation`, `reading_quiz_generation`, `video_script_generation`이다.
- 반복되는 시스템 지시와 예시는 공통 자산으로 두고, 동적 입력은 뒤에 붙인다.
- 프롬프트 변경은 비교 가능해야 하며 변경 이유를 남긴다.

## 구조화 출력
- OpenAI Structured Outputs를 우선 사용한다.
- AI 응답은 가능하면 항상 JSON Schema 또는 명시적 스키마로 제한한다.
- 자유서술 응답을 그대로 저장하거나 UI에 렌더링하지 않는다.
- 새 AI 기능에는 입력 스키마, 출력 스키마, 실패 처리, fallback 결과가 반드시 있어야 한다.
- 스키마는 필수 키 보장, 타입 안정성, 거절 감지를 목표로 설계한다.

## 평가와 승격
- 프롬프트 변경은 감으로 배포하지 않는다.
- OpenAI Datasets/Evals 원칙에 맞춰 샘플 케이스나 평가셋 없이 승격하지 않는다.
- 가능하면 정답 비교, 규칙 검사, 모델 기반 평가를 조합한다.
- 최소 평가 축은 맞춤법 정확도, 문맥 적합성, 설명 명확성, 대안 표현 유용성, 학습자료 일관성 중 일부를 포함한다.
- 활성 버전보다 품질이 낮으면 승격하지 않는다.

## 상태 관리와 fallback
- AI 초안은 `draft`, 검수 완료는 `reviewed`, 공개는 `published`, 폐기는 `archived`로 분리한다.
- 이 구분은 UI, API, DB 어디에서도 흐려지면 안 된다.
- 미검수 AI 콘텐츠를 공개 상태로 노출하지 않는다.
- API 키가 없거나 모델 호출이 실패해도 개발과 검증이 가능해야 한다.
- fallback도 실제 스키마를 따르며 관리자 검수 흐름을 점검할 수 있어야 한다.

## 구현 규칙
- 기본 스택은 `Next.js App Router`, `TypeScript`, `Tailwind CSS`를 유지한다.
- 공개 영역과 관리자 영역은 같은 저장소 안에서 라우트로 분리한다.
- 관리자 영역과 관리자 전용 API는 인증 보호를 유지한다.
- AI 로직은 라우트에 길게 쓰지 말고 `src/lib/ai`에 모은다.
- API는 검증 가능한 입력, 일관된 에러, 구조화된 출력을 우선한다.
- DB는 `Postgres` 기준으로 설계한다.

## 서브에이전트 운영 원칙
- 서브에이전트 정의는 `agents/*.toml`을 기준으로 사용한다.
- 한 작업에 여러 역할이 섞이면 먼저 경계를 나누고, 각 경계마다 가장 좁고 적합한 에이전트를 적용한다.
- 구현 전 계약 설계가 먼저 필요한 경우 설계형 에이전트를 우선 적용한 뒤 구현형 에이전트로 넘긴다.
- 공개 정책, 검수 흐름, 인증 보호를 약화시키는 제안은 채택하지 않는다.

## 목적별 서브에이전트 적용
- 전체 흐름 하나를 묶어 처리할 때는 `fullstack-developer`
- App Router, 서버 액션, 캐시, 렌더링 경계는 `nextjs-developer`
- UI 구현과 상호작용 수정은 `frontend-developer`
- 화면 구조, 정보 계층, 상태 설계는 `ui-designer`
- `ui-designer`는 의미 없는 배지, 중복 카피, 장식용 설명문처럼 과한 텍스트를 추가하지 않는다.
- API 계약, 응답 형식, 에러 모델은 `api-designer`
- 서버 로직, 인증, 실패 처리, 운영 경계는 `backend-developer`
- 타입 경계, 스키마 타입, 컴파일 안정성은 `typescript-pro`
- SQL 설계, 쿼리 검토, 마이그레이션 검토는 `sql-pro`
- 권한, 백업, 복구, 운영 DB 안정성은 `database-administrator`
- CI, 배포, 환경 변수, 릴리스 자동화는 `devops-engineer`
- 변경 검토와 회귀 위험 평가는 `reviewer`
- 테스트 범위, 인수 기준, 릴리스 리스크 평가는 `qa-expert`

## 권장 조합
- 새 AI API 추가: `api-designer` → `backend-developer` → `typescript-pro` → `reviewer` → `qa-expert`
- 관리자 검수 화면 추가: `ui-designer` → `frontend-developer` 또는 `nextjs-developer` → `reviewer`
- 프롬프트/평가 파이프라인 추가: `api-designer` → `backend-developer` → `sql-pro` → `qa-expert`
- DB 스키마/평가셋 변경: `sql-pro` → `database-administrator` → `backend-developer`
- 배포/CI 문제 해결: `devops-engineer` → 필요 시 `nextjs-developer` 또는 `backend-developer`

## 핵심 도메인
- 유지해야 할 개념은 콘텐츠, 표현 카드, 교정 사례, 프롬프트 템플릿, 프롬프트 버전, 평가셋, 평가 실행 결과, 영상 스크립트, 발행 작업이다.

## 참조 위치
- 공개 홈: `src/app/page.tsx`
- 관리자 영역: `src/app/admin`
- AI 하네스: `src/lib/ai`
- 관리자 세션/액션: `src/lib/auth`, `src/lib/admin`
- 샘플 데이터: `src/lib/content/catalog.ts`
- DB 초안: `docs/db-schema.sql`
