# Commit Conventions

## 목적
- 변경 이력을 보고 제품, 운영, AI 하네스 관점에서 무엇이 바뀌었는지 빠르게 파악한다.
- 프롬프트, 스키마, 평가, 공개 정책 변경을 서로 분리해 회귀 추적을 쉽게 만든다.
- 릴리스 전 검토자가 커밋 제목만 읽어도 위험 범위를 예측할 수 있게 한다.

## 기본 형식
- 커밋 제목은 `type(scope): summary` 형식을 사용한다.
- `summary`는 현재형 동사로 시작하고 72자 안팎으로 유지한다.
- 제목만으로 의도가 불분명하면 본문에 변경 이유와 검증 방법을 적는다.

예시:

```text
feat(correction): add structured fallback for polite Korean fixes
fix(admin-auth): block unauthenticated access to draft generation route
refactor(prompt): split lesson generator instructions by audience
test(eval): add correction cases for literal English transfer
docs(harness): define prompt versioning and promotion checklist
```

## 권장 type
- `feat`: 사용자나 운영자가 체감하는 기능 추가
- `fix`: 버그 수정, 정책 위반 수정, 회귀 수정
- `refactor`: 동작 유지 전제의 구조 개선
- `docs`: 문서 추가 및 규약 정리
- `test`: 테스트, 평가셋, 검증 로직 추가 또는 수정
- `chore`: 설정, 의존성, 개발 환경 유지보수

## 권장 scope
- `public`: 공개 학습 화면과 공개 API
- `admin`: 관리자 화면과 관리자 워크플로우
- `admin-auth`: 관리자 인증, 세션, 권한
- `correction`: 교정 기능
- `lesson`: 학습자료 생성과 발행 흐름
- `video`: 영상 스크립트 및 발행 준비
- `prompt`: 프롬프트 템플릿과 지시문
- `schema`: 입력/출력 스키마와 타입 경계
- `eval`: 평가셋, 평가 실행, 승격 기준
- `publish`: 검수 상태, 공개 상태, 발행 작업
- `db`: Postgres 스키마와 데이터 모델
- `harness`: 하네스 공통 로직과 운영 규칙

## 커밋 분리 원칙
- 프롬프트 문구 변경과 스키마 변경은 가능하면 분리한다.
- 평가셋 변경은 프롬프트 승격 커밋과 분리하거나, 반드시 본문에 연결 이유를 적는다.
- 공개 정책과 검수 상태 변경은 UI 수정과 분리하는 편을 우선한다.
- 대규모 리팩터링은 하네스 공통부, API 계약, UI 반영으로 쪼갠다.

## AI 하네스 전용 규칙
- 프롬프트 수정 커밋은 어떤 태스크가 바뀌는지 제목 또는 본문에 적는다.
- 스키마 수정 커밋은 입력/출력 호환성 여부를 본문에 적는다.
- 평가 기준 수정 커밋은 임계점수, 케이스 추가 여부, 승격 영향 범위를 적는다.
- fallback 동작 변경은 운영 리스크와 무검수 공개 위험이 없는지 함께 적는다.

## 커밋 본문 템플릿

```text
Why
- 왜 이 변경이 필요한지

What
- 무엇을 바꿨는지

Validation
- npm run typecheck
- npm run build
- 수동 확인 또는 eval 실행 결과
```

## 피해야 할 커밋
- `update`, `fix stuff`, `changes`처럼 의미 없는 제목
- 프롬프트, 스키마, 평가, UI를 한 번에 섞은 대형 커밋
- 검증 없이 활성 버전 변경만 들어 있는 커밋
- 검수 정책 완화와 공개 로직 변경을 한 번에 묶은 커밋
