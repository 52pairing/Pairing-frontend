# STATE

이 문서는 팀 전체 작업 현황이 아니라 현재 AI와 함께 진행 중인 한 가지 작업만 기록합니다.

자세한 인수인계는 `HANDOFF.md`, 완료된 작업은 `WORKLOG.md`를 사용합니다.

## 현재 작업

- 작업명: AI 협업 문서 구조 설정
- 관련 Issue: `#1`
- 관련 브랜치: `docs/ai-setup#1`
- 작업 목적: AI가 프로젝트 규칙과 현재 작업 상태를 일관되게 확인할 수 있도록 문서 구조를 설정합니다.

## 작업 범위

- 프로젝트 루트 `AGENTS.md`
- `docs/ai/frontend-convention.md`
- `docs/ai/git-issue-pr-guide.md`
- `docs/ai/security-guide.md`
- `docs/ai/testing-guide.md`
- `.ai/STATE.md`
- `.ai/HANDOFF.md`
- `.ai/WORKLOG.md`
- `.ai/API.md`
- 초기 폴더 세팅(`src/features`, `tests`, `unit-tests`) 및 `.env.example`

## 진행 상황

- [x] 루트 `AGENTS.md` 참조 문서 정리
- [x] `docs/ai/frontend-convention.md` 정리 (묻혀 있던 3개 문서 분리)
- [x] `docs/ai/git-issue-pr-guide.md` 신규 작성
- [x] `docs/ai/security-guide.md` 신규 작성
- [x] `docs/ai/testing-guide.md` 신규 작성 (실제 `package.json` 스크립트 기준)
- [x] `.ai/STATE.md` 작성
- [x] `.ai/HANDOFF.md` 코드펜스 잔여물 정리
- [x] `.ai/WORKLOG.md` 코드펜스 잔여물 정리
- [x] `.ai/API.md` 실제 API 템플릿으로 재작성
- [x] 폴더 구조 `features`(복수)로 확정, `src/feature` → `src/features`
- [x] `lib` / `services` 역할 구분 정의 및 README·컨벤션 문서 정렬
- [x] `.env.example` 생성 및 `.gitignore` 예외 처리
- [x] 문서 내부 상대 경로 및 민감 정보 확인
- [ ] Pull Request 작성 (사용자가 직접 진행)

## 현재까지 변경한 파일

### 신규

- `docs/ai/frontend-convention.md`
- `docs/ai/git-issue-pr-guide.md`
- `docs/ai/security-guide.md`
- `docs/ai/testing-guide.md`
- `.ai/STATE.md`
- `.ai/HANDOFF.md`
- `.ai/WORKLOG.md`
- `.ai/API.md`
- `.env.example`
- `src/features/.gitkeep`
- `tests/.gitkeep`
- `unit-tests/.gitkeep`

### 수정

- `AGENTS.md` — 참조 문서 및 작업 원칙 정리
- `README.md` — 폴더 작성 규칙에서 `lib`/`services` 역할 명확화
- `.gitignore` — `!.env.example` 예외 추가

### 삭제

- `src/feature/` (빈 단수 폴더 → `src/features/`로 대체)

## 다음 할 일

1. 변경 내용을 `develop` 대상으로 커밋합니다.
2. `docs/ai-setup#1` 브랜치를 push합니다.
3. `develop` 대상 Pull Request를 생성하고 `Closes #1`을 연결합니다.

## 막힌 점

- 없음

## 확인이 필요한 내용

- 공통 API 클라이언트 실제 경로 (`src/lib`)
- 폼 라이브러리
- 서버·전역 상태 관리 방식
- 테스트 도구(Jest·Playwright) 실제 도입 시점
- PR 필수 승인 인원 및 merge 방식

## 실행한 검증

- [x] 문서 상대 경로 확인
- [x] 이전 프로젝트 키워드 검색
- [x] 민감 정보 포함 여부 확인
- [x] `package.json`과 테스트 명령 비교 (test 스크립트·Jest·Playwright 미설치 확인)
- [x] 실제 폴더 구조와 프론트 컨벤션 비교
- [ ] `npm run lint` — 문서·폴더 변경만 포함되어 미실행
- [ ] `npm run build` — 문서·폴더 변경만 포함되어 미실행

## 주의사항

- main과 develop에 직접 push하지 않습니다.
- 작업 브랜치는 최신 develop에서 생성합니다.
- 실제로 확인하지 못한 프로젝트 설정을 확정된 규칙처럼 작성하지 않습니다.
- 환경변수 실제 값과 테스트 계정 정보는 문서에 작성하지 않습니다.
- commit, push, Pull Request 생성은 사용자가 직접 진행합니다.

작업이 완료되면 이 내용을 WORKLOG.md로 옮기고, STATE.md는 다음 작업 내용으로 교체합니다.
