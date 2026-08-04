# Git / Issue / PR Guide

팀의 Git 규칙 단일 출처는 저장소 루트의 `README.md`입니다.

브랜치, 커밋, 버전, 릴리즈 규칙은 `README.md`를 따릅니다.
이 문서는 규칙을 중복 정의하지 않고 AI와 작업자가 놓치기 쉬운 작업 흐름만 정리합니다.

## 1. 기본 브랜치

```text
main
develop
작업 브랜치
```

### `main`

* 실제 배포 또는 릴리즈 기준 브랜치입니다.
* 직접 push하지 않습니다.
* `develop`에서 Pull Request를 통해 병합합니다.
* 브랜치 보호 규칙을 적용합니다.

### `develop`

* 기능 통합 및 개발 기준 브랜치입니다.
* 직접 push하지 않습니다.
* 각 작업 브랜치에서 Pull Request를 통해 병합합니다.
* 브랜치 보호 규칙을 적용합니다.

### 작업 브랜치

* Issue를 만든 후 생성합니다.
* 최신 `develop`에서 분기합니다.
* 하나의 Issue와 하나의 목적을 기준으로 작업합니다.

## 2. 기본 작업 흐름

```text
Issue 생성
→ develop 최신화
→ 작업 브랜치 생성
→ 작업
→ 검증
→ commit
→ push
→ develop 대상 Pull Request
→ 팀원 리뷰
→ develop 병합
```

배포 또는 릴리즈 시:

```text
develop
→ main 대상 Pull Request
→ 팀원 리뷰
→ main 병합
```

## 3. 작업 시작

```bash
git switch develop
git pull origin develop
git switch -c 브랜치명
```

브랜치명은 반드시 루트 `README.md`의 현재 규칙을 따릅니다.

예시:

```text
feature/auth-login#12
feature/client-project-register#13
fix/auth-redirect#14
refactor/freelancer-resume-form#15
```

> 브랜치명 형식은 `README.md`를 우선합니다. README는 `{작업유형}/{역할}-{작업명}#이슈번호`(이슈 번호 앞 하이픈 없음)를 사용합니다. 예시와 README가 다를 경우 README를 따릅니다.

## 4. Issue 작성

Issue에는 최소한 다음 내용을 포함합니다.

* 작업 목적
* 작업 범위
* 세부 작업 체크리스트
* 완료 조건
* 검증 방법
* 관련 화면 또는 라우트
* 필요한 API
* 관련 브랜치 형식

작업 범위가 너무 크면 하나의 Issue에 모두 넣지 않고 기능 단위로 분리합니다.

## 5. commit

커밋 형식과 타입은 루트 `README.md`를 따릅니다.

커밋 전 확인합니다.

```bash
git status
git diff
```

확인할 내용:

* 의도하지 않은 파일이 포함되지 않았는지
* `.env` 등 민감한 파일이 포함되지 않았는지
* 디버깅용 로그가 남아 있지 않은지
* 요청 범위 밖의 변경이 섞이지 않았는지
* 실제 실행한 검증 결과가 무엇인지

커밋은 가능한 한 하나의 목적을 가지도록 나눕니다.

## 6. Pull Request

Pull Request의 기본 대상 브랜치는 `develop`입니다.

PR 본문에는 다음 내용을 포함합니다.

### 목적

왜 이 변경이 필요한지 작성합니다.

### 변경 내용

핵심 변경 사항을 요약합니다.

### 관련 Issue

```text
Closes #이슈번호
```

### 검증 결과

실제로 실행한 검증만 작성합니다.

예시:

```text
- npm run lint: 통과
- npm run build: 통과
- 브라우저 확인: 완료
- 실제 API 성공 응답 확인: 미실행
```

### 스크린샷

UI 변경이 있다면 변경 전후 또는 주요 화면을 첨부합니다.

### 확인이 필요한 내용

실제 확인하지 못한 항목이나 백엔드 확인이 필요한 내용을 작성합니다.

## 7. 리뷰 및 병합

* 작성자가 자신의 PR을 검토한 뒤 리뷰를 요청합니다.
* 최소 승인 인원은 GitHub 브랜치 보호 규칙과 팀 규칙을 따릅니다.
* 리뷰 의견을 무시하고 임의로 병합하지 않습니다.
* 리뷰 반영 후 동작이 바뀌었다면 필요한 검증을 다시 실행합니다.
* force push가 필요한 상황에서는 팀원과 먼저 공유합니다.
* main과 develop에 직접 push하지 않습니다.

## 8. 충돌 해결

충돌이 발생하면 작업 브랜치에서 해결합니다.

```bash
git switch develop
git pull origin develop
git switch 작업브랜치
git merge develop
```

또는 팀에서 rebase를 사용한다면 README 규칙을 따릅니다.

충돌 해결 후 변경 내용을 다시 확인하고 검증합니다.

## 9. API 연동 변경

API 연동이 포함된 작업은 다음을 확인합니다.

* Swagger
* 백엔드 PR의 프론트 영향 내용
* 요청 필드
* 응답 필드
* nullable 필드
* enum
* HTTP status
* errorCode
* 인증 필요 여부

프론트가 실제 사용하는 API는 `.ai/API.md`에 반영합니다.

백엔드 구현 또는 배포 대기 중이라면 다음 위치에 기록합니다.

* Issue
* Pull Request
* `.ai/STATE.md`

## 10. AI 도구 작업 원칙

AI 도구는 사용자의 명시적인 요청 없이 다음 작업을 수행하지 않습니다.

* Issue 생성 또는 종료
* 브랜치 생성 또는 삭제
* commit
* push
* Pull Request 생성
* merge
* 릴리즈
* 태그 생성

AI가 추천한 브랜치명과 커밋 메시지도 최종적으로 루트 `README.md` 규칙과 비교합니다.
