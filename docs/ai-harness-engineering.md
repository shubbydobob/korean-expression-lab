# AI Harness Engineering

## 목적
- 이 저장소의 AI 기능을 단순 프롬프트 호출이 아니라 운영 가능한 하네스로 관리한다.
- 모든 AI 출력은 스키마, fallback, eval, 검수, 상태 전이를 포함한 제품 자산으로 취급한다.
- 구현 하네스뿐 아니라 작업 방식도 하네스처럼 설계해서, 목적별 서브에이전트를 반복 가능한 절차로 사용한다.

## 적용 범위
- `src/lib/ai/prompts.ts`: 태스크별 프롬프트 자산
- `src/lib/ai/schemas.ts`: 입력/출력 스키마
- `src/lib/ai/harness.ts`: 호출, 파싱, fallback, 추적, eval 실행
- `src/app/api/admin/*`: 관리자 전용 생성, eval, 활성화 API
- `src/lib/content/repository.ts`: 프롬프트 버전, eval run, ai run, 상태 관리
- `docs/db-schema.sql`: 영속 저장 구조
- `agents/*.toml`: 작업 단계별 서브에이전트 하네스

## 제품 하네스 원칙
- 프롬프트는 자산처럼 버전 관리한다.
- 스키마 없는 응답은 저장하거나 렌더링하지 않는다.
- fallback은 실제 응답 스키마를 만족해야 한다.
- eval 없이 프롬프트 버전을 활성화하지 않는다.
- `draft`, `reviewed`, `published`, `archived` 상태를 공개 정책의 기준으로 삼는다.

## 작업 하네스 원칙
- 기능 작업은 `설계 -> 구현 -> 리뷰 -> 검증` 단계로 나눈다.
- 각 단계는 목적에 맞는 서브에이전트를 배치한다.
- 메인 에이전트는 통합과 최종 판단을 담당하고, 세부 단계는 가능한 한 역할별 에이전트에 위임한다.
- 실제 수행한 서브에이전트 조합은 작업 로그로 남겨 재현 가능하게 관리한다.

## 단계별 서브에이전트 매핑
### 1. 설계
- UI/UX 결정: `ui-designer`
- API 계약/스키마: `api-designer`
- 라우팅/서버 액션 경계: `nextjs-developer`
- 타입 경계 점검: `typescript-pro`

### 2. 구현
- 클라이언트 구현: `frontend-developer`
- 서버/API/인증/하네스 구현: `backend-developer`
- 화면과 서버를 함께 바꾸는 기능: `fullstack-developer`
- SQL/스키마 변경: `sql-pro`
- 운영 DB 관점: `database-administrator`

### 3. 리뷰
- 회귀/보안/계약 파손/누락 테스트: `reviewer`

### 4. 검증
- 테스트 시나리오/인수 조건/실패 경로: `qa-expert`
- CI/배포/환경 문제: `devops-engineer`

## 새 AI 기능 추가 절차
1. `api-designer`로 입력/출력 스키마와 응답 구조를 정한다.
2. `backend-developer`가 `prompts.ts`, `schemas.ts`, `harness.ts`에 기능을 추가한다.
3. 타입 경계가 넓으면 `typescript-pro`가 계약 일관성을 검토한다.
4. `reviewer`가 fallback, eval gate, 공개 차단 원칙 위반이 없는지 본다.
5. `qa-expert`가 정상/실패/API 통합 경로의 검증 항목을 정리한다.
6. 메인 에이전트가 타입체크, 빌드, 테스트, 배포를 최종 수행한다.

## 공개 UI 변경 절차
1. `ui-designer`가 정보 구조와 상태 표현을 먼저 정리한다.
2. `frontend-developer` 또는 `nextjs-developer`가 화면을 구현한다.
3. 텍스트, 접근성, 상호작용 회귀를 `reviewer`가 본다.
4. `qa-expert`가 주요 사용자 흐름과 실패 상태를 점검한다.

## DB 변경 절차
1. `sql-pro`가 스키마/쿼리 구조를 설계한다.
2. `database-administrator`가 제약, 인덱스, 운영 안정성을 검토한다.
3. `backend-developer`가 저장 계층과 연결한다.
4. `reviewer`가 마이그레이션 리스크를 본다.

## 검증 기준
- `npm run typecheck`
- `npm run build`
- `npm run test`
- 필요 시 `npm run db:seed`, `npm run db:verify`, `npm run db:test`
- 공개 기능이 검수/상태 관리 원칙을 우회하지 않는지 확인
- 새 AI 기능에 입력/출력 스키마, fallback, eval 또는 최소 검증 경로가 존재하는지 확인

## 리뷰 질문
- 이 변경이 스키마 없는 AI 응답을 허용하는가
- 이 변경이 eval 없이 프롬프트를 활성화하게 만드는가
- 이 변경이 검수되지 않은 콘텐츠를 공개 상태로 노출하는가
- 이 변경이 fallback 없이 모델 성공만 가정하는가
- 이 변경이 단계별 서브에이전트 하네스를 생략해 단일 에이전트에 과도하게 몰리는가

## Subagent Log Format
- `step`: 설계, 구현, 리뷰, 검증
- `agent`: 사용한 서브에이전트
- `purpose`: 맡긴 일
- `scope`: 파일 또는 기능 범위
- `result`: 산출물 요약
- `validation`: 확인한 내용과 남은 리스크
