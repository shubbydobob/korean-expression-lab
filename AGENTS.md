# AGENTS.md

## 제품 원칙
- 일반 사용자는 회원가입 없이 공개 자료를 탐색한다.
- 운영자는 내부 관리자 영역에서만 콘텐츠와 AI 자산을 관리한다.
- AI 결과를 그대로 공개하지 않는다.
- 공개 콘텐츠는 반드시 사람 검수를 거친다.
- 생성 속도보다 교육 품질, 설명 가능성, 운영 가능성을 우선한다.

## 구현 규칙
- 기본 스택은 `Next.js App Router`, `TypeScript`, `Tailwind CSS`를 유지한다.
- 공개 영역과 관리자 영역은 같은 저장소 안에서 라우트로 분리한다.
- 관리자 영역과 관리자 전용 API는 인증 보호를 유지한다.
- AI 로직은 라우트에 길게 쓰지 말고 `src/lib/ai`에 모은다.
- API는 검증 가능한 입력, 일관된 에러, 구조화된 출력을 우선한다.
- DB는 `Postgres` 기준으로 설계한다.

## Subagent Harness
- 이 저장소의 서브에이전트 정의는 `agents/*.toml`을 기준으로 사용한다.
- 작업이 두 단계 이상이면 메인 에이전트가 전부 직접 처리하지 말고 목적별 서브에이전트로 분해한다.
- 최소 운용 단위는 `설계 -> 구현 -> 리뷰 -> 검증`이다.
- 공개 정책, 검수 흐름, 인증 보호를 약화시키는 제안은 어떤 서브에이전트가 하더라도 채택하지 않는다.

## 단계별 기본 배치
1. 설계
- UI/UX: `ui-designer`
- API 계약/응답 형식: `api-designer`
- App Router 경계/서버 액션/라우팅: `nextjs-developer`
- 타입 경계가 복잡하면 `typescript-pro`

2. 구현
- 공개 화면/상호작용: `frontend-developer`
- 서버 로직/API/인증/에러 처리: `backend-developer`
- 화면과 서버를 함께 건드리면 `fullstack-developer`
- SQL/스키마/마이그레이션: `sql-pro` 또는 `database-administrator`

3. 리뷰
- 변경 리스크, 회귀, 보안, 누락된 테스트 확인: `reviewer`

4. 검증
- 테스트 전략, 인수 조건, 실패 경로 점검: `qa-expert`
- 배포/CI/환경 이슈 확인이 필요하면 `devops-engineer`

## 작업 유형별 권장 조합
- 공개 UI 개편: `ui-designer` -> `frontend-developer` -> `reviewer` -> `qa-expert`
- 관리자 기능 추가: `api-designer` -> `backend-developer` 또는 `fullstack-developer` -> `reviewer` -> `qa-expert`
- AI 기능 추가: `api-designer` -> `backend-developer` -> `typescript-pro` -> `reviewer` -> `qa-expert`
- 프롬프트/스키마/eval 변경: `api-designer` -> `backend-developer` -> `reviewer` -> `qa-expert`
- DB 변경: `sql-pro` -> `database-administrator` -> `backend-developer` -> `reviewer`
- 배포 실패/런타임 장애: `devops-engineer` -> 필요 시 `nextjs-developer` 또는 `backend-developer` -> `reviewer`

## 실행 규칙
- 메인 에이전트는 작업을 시작할 때 어떤 서브에이전트를 어떤 목적으로 태우는지 먼저 정한다.
- 탐색만 필요하면 `explorer` 성격의 에이전트를 쓰고, 실제 수정은 역할에 맞는 구현 에이전트가 맡는다.
- 구현 에이전트와 리뷰 에이전트의 역할을 섞지 않는다.
- 리뷰 없이 바로 배포하지 않는다. 최소 `reviewer` 또는 `qa-expert` 중 하나의 점검을 거친다.
- 변경이 UI와 서버를 함께 건드리면 한 에이전트에 몰지 말고 경계를 나눠 병렬화한다.

## Subagent Log
- 작업 결과에는 어떤 서브에이전트를 어떤 단계에 사용했는지 남긴다.
- 최소 기록 항목은 `단계`, `서브에이전트`, `목적`, `적용 파일 또는 범위`, `검증 여부`다.
- 문서 변경만 있는 작업이 아니라면 최종 보고에 서브에이전트 사용 내역을 포함한다.

## Git 작업 규칙
- 모든 작업은 변경 의도를 추적할 수 있는 커밋 단위로 나눈다.
- 커밋 메시지는 `type(scope): summary` 형식을 기본으로 사용한다.
- AI 하네스 변경은 가능하면 `prompt`, `schema`, `eval`, `review`, `publish` 범위 중 하나를 scope에 드러낸다.
- 프롬프트 변경, 스키마 변경, 평가 기준 변경은 한 커밋에 무분별하게 섞지 않는다.
- 검수 정책, 공개 정책, 인증 보호를 약화시키는 변경은 별도 커밋으로 분리하고 이유를 남긴다.

## 금지사항
- 프롬프트를 UI 컴포넌트에 하드코딩하지 말 것.
- 스키마 없는 AI 응답을 저장하거나 렌더링하지 말 것.
- 평가 없이 프롬프트 버전을 활성화하지 말 것.
- 검수 흐름을 우회하는 자동 공개 로직을 만들지 말 것.
- 회원가입 없는 현재 제품 방향을 임의로 뒤집지 말 것.

## 참조 위치
- 공개 홈: `src/app/page.tsx`
- 관리자 영역: `src/app/admin`
- AI 하네스: `src/lib/ai`
- 관리자 세션/액션: `src/lib/auth`, `src/lib/admin`
- 샘플 데이터: `src/lib/content/catalog.ts`
- DB 초안: `docs/db-schema.sql`
- 운영 세부 규칙: `docs/agent-operations.md`
- 하네스 엔지니어링: `docs/ai-harness-engineering.md`
- 커밋 규약: `docs/commit-conventions.md`

## 완료 기준
- 타입 검사 통과
- 빌드 통과
- 새 AI 기능의 입력/출력 스키마 존재
- 운영 리스크에 대한 fallback 또는 에러 처리 존재
- 공개 기능이 검수/상태 관리 원칙을 깨지 않음
- 커밋 단위가 변경 의도와 검증 범위를 설명할 수 있음
