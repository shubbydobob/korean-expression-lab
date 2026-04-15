# Agent Operations

## 목적
- 이 저장소는 순우리말, 한국어, 영어 표현, 읽기 이해를 다루는 공개 학습 아카이브를 만든다.
- AI는 단순 생성기가 아니라 프롬프트, 스키마, eval, 검수, 공개 흐름을 포함한 운영 가능한 시스템으로 다룬다.
- 작업 수행 역시 하네스 엔지니어링 관점에서, 메인 에이전트 단독 처리보다 목적별 서브에이전트 조합을 우선한다.

## 운영 원칙
- `agents/*.toml`에 있는 역할 정의를 실제 작업 단계에 연결해 사용한다.
- 한 작업 안에 설계, 구현, 리뷰, 검증이 섞이면 각 단계를 분리한다.
- 구현 에이전트가 낸 결과는 반드시 `reviewer` 또는 `qa-expert`가 다시 점검한다.
- 공개 정책, 검수 흐름, 인증 보호를 약화시키는 제안은 어떤 에이전트가 내더라도 기각한다.

## 기본 단계
### 1. 설계
- 화면 구조, 정보 배치, 상호작용 흐름: `ui-designer`
- API 계약, 응답 포맷, 에러 모델: `api-designer`
- App Router 경계, 서버 액션, 캐시, 라우팅: `nextjs-developer`
- 복잡한 타입 경계: `typescript-pro`

### 2. 구현
- 화면 구현과 클라이언트 상호작용: `frontend-developer`
- 서버 로직, 인증, API, 운영 경계: `backend-developer`
- 화면과 서버를 함께 바꾸는 기능: `fullstack-developer`
- SQL, 인덱스, 스키마, 쿼리: `sql-pro`
- DB 운영 관점 검토: `database-administrator`

### 3. 리뷰
- 회귀, 리스크, 보안, 계약 파손, 테스트 누락: `reviewer`

### 4. 검증
- 테스트 전략, 인수 기준, 실패 경로: `qa-expert`
- 배포, 환경 변수, CI, 런타임 로그: `devops-engineer`

## 작업 유형별 조합
### 공개 UI 개편
- `ui-designer`로 레이아웃과 상태를 먼저 정리한다.
- `frontend-developer` 또는 `nextjs-developer`가 구현한다.
- `reviewer`가 회귀와 접근성 리스크를 검토한다.
- `qa-expert`가 인수 기준과 실패 경로를 점검한다.

### 관리자 기능 추가
- `api-designer`로 입력/출력 계약을 먼저 정리한다.
- `backend-developer` 또는 `fullstack-developer`가 구현한다.
- 관리자 인증, 상태 전이, 공개 차단이 깨지지 않는지 `reviewer`가 본다.
- `qa-expert`가 관리자 흐름의 정상/실패 경로를 확인한다.

### AI 하네스 변경
- `api-designer`가 입력/출력 스키마와 응답 구조를 정의한다.
- `backend-developer`가 프롬프트, 하네스, fallback, eval 경로를 구현한다.
- 타입 경계가 커지면 `typescript-pro`를 추가한다.
- `reviewer`가 공개 정책, eval gate, fallback 누락을 우선 검토한다.
- `qa-expert`가 eval, fallback, API 실패 경로 검증 범위를 정리한다.

### DB 변경
- `sql-pro`가 스키마와 쿼리 구조를 설계한다.
- `database-administrator`가 운영 안정성, 제약, 백업/복구 관점을 확인한다.
- `backend-developer`가 저장 계층과 애플리케이션 경계를 연결한다.
- `reviewer`가 마이그레이션 리스크를 검토한다.

### 배포/CI 이슈
- `devops-engineer`가 원인 범위를 먼저 좁힌다.
- 프런트 문제면 `nextjs-developer`, 서버 문제면 `backend-developer`를 붙인다.
- `reviewer`가 재발 방지 수준까지 정리한다.

## 메인 에이전트 책임
- 시작 전에 어떤 단계가 필요한지 정한다.
- 각 단계에 맞는 서브에이전트를 배치한다.
- 결과를 통합하고, 충돌을 해소하고, 최종 검증과 배포를 수행한다.
- 역할이 중복되거나 한 에이전트에 과도하게 몰리지 않도록 조정한다.

## Subagent Operation Log
- 모든 실작업은 어떤 서브에이전트를 어느 단계에 사용했는지 남긴다.
- 최소 로그 필드는 다음과 같다.
- `step`: 설계, 구현, 리뷰, 검증 중 어느 단계인지
- `agent`: 사용한 서브에이전트 이름
- `purpose`: 맡긴 목적
- `scope`: 담당 파일 또는 기능 범위
- `validation`: 해당 단계에서 수행한 확인 또는 미검증 항목
- 최종 보고에는 이 로그를 요약해서 포함한다.

## 금지 패턴
- UI 문제를 설계 검토 없이 바로 구현부터 시작하는 것
- API 계약 변경을 `api-designer` 없이 라우트 코드에서 바로 밀어넣는 것
- 하네스 변경을 `reviewer` 없이 바로 배포하는 것
- DB 변경을 `sql-pro` 또는 `database-administrator` 없이 애플리케이션 코드만 고치는 것
- 검증 없이 “로컬에서 됐다”만으로 종료하는 것

## 산출물 기준
- 설계 단계: 레이아웃/계약/경계에 대한 구현 가능한 지침
- 구현 단계: 실제 코드와 필요한 스키마/스토리지 변경
- 리뷰 단계: 재현 가능한 리스크 또는 무결성 확인 결과
- 검증 단계: 정상 경로, 실패 경로, 통합 경계에 대한 테스트/확인 결과
