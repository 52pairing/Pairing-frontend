# WORKLOG

완료된 작업을 날짜별로 기록합니다.

최신 항목을 위에 추가합니다.
진행 중인 작업은 `STATE.md`에 기록합니다.

---

## 2026-08-09 — 역할별 헤더 로그인 사용자 정보 연결

### 작업 요약

- `GET /api/v1/auth/me` 서비스와 헤더용 조회 hook을 추가했습니다.
- 로그인 사용자의 실제 역할과 이름을 클라이언트·프리랜서 헤더에 표시합니다.
- 프로필 아이콘은 이름 첫 글자를 사용하고 하드코딩된 이름·알림 숫자를 제거했습니다.
- 헤더 외의 페이지 본문과 기능은 변경하지 않았습니다.
- 프로필 메뉴의 로그아웃 버튼을 실제 API와 연결하고 중복 클릭을 방지했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로그인된 백엔드 환경에서 미검증

---

## 2026-08-09 — 프리랜서 소셜 로그인·회원가입 API 연결

### 작업 요약

- 카카오·구글 인증 화면 URL을 조회하는 타입과 서비스 함수를 추가했습니다.
- 프리랜서 로그인 화면의 소셜 버튼에 API 호출과 외부 인증 화면 이동을 연결했습니다.
- 요청 중 중복 클릭 방지, 실패 메시지, 앱 내부 `returnUrl` 검증을 추가했습니다.
- `/login/social/callback`에서 `code`, `state`를 백엔드에 전달하도록 구현했습니다.
- 기존 회원 로그인과 신규 회원 추가가입 응답을 분기했습니다.
- 가입 티켓은 URL이나 브라우저 저장소에 남기지 않고 메모리에만 보관합니다.
- 소셜 추가가입 화면의 목업 이메일·이름을 실제 콜백 정보로 교체했습니다.
- 소셜 프리랜서 최종 가입 API와 성공 후 프리랜서 홈 이동을 연결했습니다.
- 가입 티켓이 없을 때 소셜 로그인을 다시 시작하도록 안내합니다.
- 회원가입 역할 선택 화면의 카카오·구글 아이콘을 실제 인증 버튼으로 연결했습니다.
- 로그인과 회원가입에서 사용하는 인증 시작 로직을 공통 hook으로 정리하고 소셜 아이콘 크기를 키웠습니다.
- 공급자별 OAuth 설정에 맞춰 `/oauth/callback/google`, `/oauth/callback/kakao` 콜백 경로를 추가했습니다.
- 콜백 처리를 브라우저 전용 컴포넌트로 분리해 SSR의 `window is not defined` 오류를 수정했습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] `npx next typegen`
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 OAuth/API — 백엔드 및 공급자 설정 미확인으로 미검증

### 남은 확인

- 백엔드 OAuth Redirect URI와 실제 카카오·구글 인증 흐름을 확인합니다.

---

## 2026-08-09 — 회원가입 API 코드 정리

### 작업 요약

- 중복 확인과 가입 요청에 반복되던 숫자 정규화 함수를 공통 유틸로 이동했습니다.
- 클라이언트와 일반 프리랜서 위저드의 제출 로딩·오류 처리를 공통 hook으로 정리했습니다.
- API 연동 전 상태를 설명하던 오래된 주석을 현재 동작에 맞게 수정했습니다.
- 역할별 위저드 단계와 소셜 가입 흐름은 변경하지 않았습니다.

### 실행한 검증

- [x] `npx tsc --noEmit`
- [x] `npx eslint src/features/auth`
- [x] `git diff --check`
- [ ] 실제 화면·API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 일반 회원가입 제출 API 연결

### 작업 요약

- 클라이언트와 일반 프리랜서의 최종 회원가입 서비스를 추가했습니다.
- 단계별 폼 상태를 백엔드 요청 구조로 변환하는 함수를 분리했습니다.
- 숫자 필드, 생년월일, 카드·계좌, 선택 약관 미동의를 포함한 약관 배열을 요청 규격에 맞게 구성했습니다.
- 제출 로딩과 오류 표시를 추가하고 성공한 경우에만 가입 완료 화면을 표시하도록 변경했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

### 남은 작업

- 소셜 로그인 콜백에서 받은 `signUpTicket`을 연결한 뒤 소셜 프리랜서 가입 제출 API를 연동합니다.

---

## 2026-08-09 — 회원가입 이메일 인증 API 연결

### 작업 요약

- 공통 이메일 인증 서비스에 인증코드 확인 API를 추가했습니다.
- 회원가입 인증코드 발송과 확인을 실제 API 호출로 교체했습니다.
- 서버의 `expiresAt` 기준 타이머와 남은 발송 횟수, 발송·확인 로딩 상태를 반영했습니다.
- 이메일 변경, 코드 만료, 시도 횟수 초과 상황의 초기화와 재발송 처리를 추가했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 회원가입 중복 확인 API 연결

### 작업 요약

- 이메일·휴대폰번호·사업자등록번호 중복 확인 서비스를 추가했습니다.
- 공통 hook에서 요청 상태와 오류를 관리하고, 오래된 요청 결과가 최신 입력 상태를 덮어쓰지 않도록 처리했습니다.
- 입력값이 바뀌면 확인 결과를 초기화하며, 사용 가능 응답을 받은 값만 다음 단계로 진행할 수 있게 했습니다.
- 소셜 프리랜서 화면의 전화번호 입력도 공통 중복 확인 필드로 통일했습니다.

### 실행한 검증

- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [x] `git diff --check`
- [ ] 실제 API — 로컬 백엔드 미응답으로 미검증

---

## 2026-08-09 — 회원가입 메타·약관 조회 API 연결

### 작업 목적

- 회원가입 화면의 목업 사업 분야·직원 수·은행·약관을 실제 조회 API로 교체했습니다.

### 작업 요약

- 메타 목록과 역할별 약관의 요청·응답 타입 및 서비스 함수를 추가했습니다.
- 공통 조회 hook에서 로딩, 실패, 재시도를 관리하도록 구성했습니다.
- 클라이언트·프리랜서·소셜 프리랜서가 같은 약관 단계를 재사용하도록 정리했습니다.
- 주요 타입과 서비스 함수에 역할을 설명하는 짧은 주석을 추가했습니다.

### 관련 Issue 및 브랜치

- Issue: `#40`
- 브랜치: `feature/common-signup-api#40`

### 실행한 검증

- [x] Next.js 라우트 타입 생성
- [x] TypeScript 검사
- [x] 변경 파일 대상 ESLint
- [ ] 전체 lint — 120초 제한 초과
- [ ] build — 기존 `/login`의 `useSearchParams` Suspense 오류로 실패
- [ ] 실제 API — 로컬 백엔드 8080 요청 시간 초과로 미검증

### 다음 작업

- 백엔드 실행 후 메타·약관 실제 응답과 화면을 확인합니다.
- 이후 이메일·전화번호·사업자번호 중복 확인 API를 연결합니다.

---

## 2026-08-07 — 로그인 · 계정 찾기 · 로그인 상태 알림 화면 구현 (UI, PR 제출)

### 작업 목적

- 로그인 화면과 아이디·비밀번호 찾기 플로우, 로그인 상태 관련 알림(중복 로그인/세션 만료/계정 잠금/로그인 시도 제한) UI를 구현했습니다.
- 이 시점에는 실제 API 연동 전이라 화면은 전부 mock 값으로 동작합니다.

### 작업 요약

- 로그인 페이지 UI, 아이디 찾기(입력→결과), 비밀번호 찾기 4단계(입력→발송완료→임시비밀번호 발급→새 비밀번호 등록→완료) 화면을 만들었습니다.
- 공용 `ConfirmModal`을 재사용해 중복 로그인 모달·세션 만료 모달을 만들고, 확인 시 `/login`으로 이동하도록 했습니다.
- 계정 잠금 배너·로그인 시도 제한 배너 컴포넌트를 만들었습니다 (아직 로그인 폼에는 연결 안 함).
- 공용 `Modal`이 열릴 때 스크롤바가 사라지며 배경이 밀리는 버그를 스크롤바 너비만큼 `padding-right`를 보정하는 방식으로 수정했습니다.

### 관련 Issue 및 브랜치

- Issue: `#18`
- 브랜치: `feature/common-login#18`
- Pull Request: 생성 완료 (`Closes #18`)

### 수정 파일

#### 신규

- `src/app/login/findemail/page.tsx`, `src/app/login/findpassword/page.tsx`, `src/app/login/findpassword/verify/page.tsx`, `src/app/login/findpassword/reset/page.tsx`
- `src/app/signup/page.tsx` (플레이스홀더만)
- `src/features/auth/components/AuthHeader.tsx`, `BackLink.tsx`, `FindEmailForm.tsx`, `FindEmailResult.tsx`, `FindPasswordForm.tsx`, `FindPasswordSent.tsx`, `TempPasswordIssued.tsx`, `NewPasswordForm.tsx`, `NewPasswordDone.tsx`, `OtherDeviceLoginModal.tsx`, `LoginSessionExpiredModal.tsx`, `AccountLockedAlert.tsx`, `LoginRestrictedAlert.tsx`
- `src/features/auth/utils/formatPhoneNumber.ts`
- `public/icons/CheckIcon-green.svg`, `EmailIcon-green.svg`, `LeftAngleBracketIcon.svg`

#### 수정

- `src/app/login/page.tsx` — 로그인 페이지 UI 구현
- `src/features/common/components/Modal.tsx` — 스크롤 잠금 시 배경 흔들림 버그 수정

### API 변경

- 없음 (전부 mock, 실제 연동은 다음 작업(`#28`)에서 진행)

### 문제와 해결

- 문제: `findemail/page.tsx`가 `FindEmailResult`에 더 이상 없는 `onBack` prop을 넘겨 `npm run build`가 타입 에러로 실패.
- 원인: `FindEmailResult`를 뒤로가기 버튼 없는 형태로 리팩터링하면서 호출부를 같이 안 고침.
- 해결: 미해결 — PR은 이 상태로 제출했고, 정리는 다음 브랜치(`#28`)에서 진행하기로 함 (사용자 결정).
- 남은 위험: 이 상태로는 CI 빌드가 실패할 수 있음.

### 실행한 검증

- [x] lint — 통과
- [x] build — 실패 (`findemail/page.tsx` 타입 에러)
- [ ] 단위 테스트 (도구 미도입)
- [ ] E2E 테스트 (도구 미도입)
- [x] 브라우저 확인 — 아이디 찾기, 비밀번호 찾기 4단계, 모달 2종 클릭 테스트
- [ ] 실제 API 정상 응답 확인 — 연동 전
- [ ] API 에러 응답 확인 — 연동 전
- [ ] 반응형 확인

### 검증 결과

- 통과: lint, 브라우저 클릭 테스트
- 실패: build (타입 에러 1건)
- 미실행: 단위/E2E 테스트, 반응형 확인, 실제 API 확인
- 미실행 이유: 테스트 도구 미도입, 반응형은 시간상 생략, API는 연동 전

### 확인하지 못한 내용

- 실제 로그인/계정찾기 API 응답 (연동 전)

### 다음 참고사항

- PR(`Closes #18`)에 아래 정리 항목이 남아있는 상태로 제출됨. 후속 브랜치(`feature/common-login-api#28`)에서 처리 필요:
  - `findemail/page.tsx`의 `onBack` prop 제거 (빌드 실패 해결)
  - `login/page.tsx`의 모달 확인용 임시 테스트 버튼 제거
  - `TempPasswordIssued.tsx`의 "(테스트) 새 비밀번호 등록 화면 보기" 임시 링크 정리 여부 결정
  - 빈 스캐폴딩 파일 3개(`FindPasswordVerified.tsx`, `ResetPasswordComplete.tsx`, `ResetPasswordForm.tsx`) 삭제 여부 결정
- 이어지는 작업은 `.ai/STATE.md`에 새 작업(`#28` 로그인 API 연동)으로 기록함.

---

<!--
아래 블록을 복사해 최신 기록을 맨 위에 추가합니다.

## YYYY-MM-DD — 작업 제목

### 작업 목적

- 어떤 문제를 해결하기 위한 작업인지 작성합니다.

### 작업 요약

- 구현하거나 수정한 핵심 내용을 작성합니다.
- 기존 동작에서 달라진 내용을 작성합니다.
- 중요한 구조 변경이 있다면 이유를 작성합니다.

### 관련 Issue 및 브랜치

- Issue:
- 브랜치:
- Pull Request:

### 수정 파일

#### 신규
- 없음

#### 수정
- 없음

#### 삭제
- 없음

### API 변경

- 없음 (변경이 있다면 상세 내용은 `API.md`에 작성)

### 문제와 해결

- 문제:
- 원인:
- 해결:
- 남은 위험:

### 실행한 검증

- [ ] lint
- [ ] build
- [ ] 단위 테스트 (도구 도입 후)
- [ ] E2E 테스트 (도구 도입 후)
- [ ] 브라우저 확인
- [ ] 실제 API 정상 응답 확인
- [ ] API 에러 응답 확인
- [ ] 반응형 확인

### 검증 결과

- 통과:
- 실패:
- 미실행:
- 미실행 이유:

### 확인하지 못한 내용

- 없음

### 다음 참고사항

- 후속 작업자가 알아야 하는 내용
- 임시 처리와 제거 조건
- 백엔드 확인이 필요한 내용
- 관련 Issue 또는 후속 작업
-->

## 2026-08-04 — AI 협업 문서 구조 설정 (예시)

### 작업 목적

- AI가 프로젝트 규칙과 현재 작업 상태를 일관되게 확인할 수 있도록 문서 구조를 설정했습니다.

### 작업 요약

- 프로젝트 루트에 `AGENTS.md`를 추가했습니다.
- `docs/ai`에 프론트, Git, 보안, 테스트 규칙을 정리했습니다.
- `.ai`에 현재 작업, 인수인계, 완료 기록, API 문서를 추가했습니다.
- `docs/ai`는 고정 규칙, `.ai`는 현재 작업 기록으로 역할을 분리했습니다.

### 관련 Issue 및 브랜치

- Issue: `#이슈번호`
- 브랜치: `feature/common-ai-docs-setup#이슈번호`
- Pull Request: 확인 후 추가

### 수정 파일

#### 신규

- `AGENTS.md`
- `docs/ai/frontend-convention.md`
- `docs/ai/git-issue-pr-guide.md`
- `docs/ai/security-guide.md`
- `docs/ai/testing-guide.md`
- `.ai/STATE.md`
- `.ai/HANDOFF.md`
- `.ai/WORKLOG.md`
- `.ai/API.md`

### 실행한 검증

- [x] 문서 상대 경로 확인
- [x] 이전 프로젝트 관련 내용 확인
- [x] 민감 정보 포함 여부 확인
- [ ] build — 문서 변경만 포함되어 미실행
- [ ] 브라우저 확인 — 문서 변경만 포함되어 미실행

### 다음 참고사항

- 실제 프로젝트 설정이 확정되면 프론트 컨벤션의 API 클라이언트 경로와 테스트 스크립트를 갱신해야 합니다.
- 위 항목은 예시 기록입니다. 실제 작업 완료 시 이 블록을 실제 내용으로 교체하거나 삭제합니다.

---
