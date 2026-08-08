# STATE

이 문서는 팀 전체 작업 현황이 아니라 현재 AI와 함께 진행 중인 한 가지 작업만 기록합니다.

자세한 인수인계는 `HANDOFF.md`, 완료된 작업은 `WORKLOG.md`를 사용합니다.

## 현재 작업

- 작업명: 로그인 · 아이디 찾기 · 비밀번호 찾기 실제 API 연동
- 관련 Issue: `#28`
- 관련 브랜치: `feature/common-login-api#28`
- 작업 목적: 백엔드 연동 가이드(`frontend-auth-integration.md`)를 기준으로 로그인/아이디 찾기/비밀번호 찾기(전체 흐름)와 계정 잠금 해제를 실제 API에 연동합니다.

## 작업 범위

- `src/lib/api.ts` (공통 API 클라이언트)
- `src/features/auth/types.ts`, `src/features/auth/services/**` (로그인/아이디 찾기/비밀번호 찾기/이메일 인증/잠금 해제 타입·서비스 함수)
- `src/app/login/**`, `src/app/reset-password/**` (관련 화면)

## 진행 상황

- [x] 로그인(`POST /auth/login`) 연동 — `AU_002`→계정잠금 배너, `AU_014`→로그인제한 배너, `tempPassword` 분기, `returnUrl` 복귀
- [x] 아이디 찾기(`POST /auth/find-email`) 연동 — `accounts` 배열(0~2건) 처리
- [x] 비밀번호 찾기 1~3단계 연동 완료
  - 1~2단계: `POST /auth/password/reset-requests` (역할 탭 추가, 항상 200이라 일반 안내 문구)
  - 3단계: `/reset-password?token=...` — 버튼 클릭으로만 `POST /auth/password/reset-confirm` 호출
- [x] 새 비밀번호 등록 화면(`/login/findpassword/reset`) — 실제 `PATCH /auth/password { newPassword, newPasswordConfirm }` 연동 완료. `NewPasswordForm`이 검증된 비밀번호 값을 상위로 전달하도록 변경, 로딩/에러 상태 추가
- [x] 계정 잠금 해제 — `UnlockAccountModal` 신규 구현
  - `POST /auth/email-verifications { purpose: "UNLOCK" }` → `POST /auth/unlock { email, role, code }` (`/email-verifications/confirm`은 거치지 않음)
  - 로그인 페이지의 `AccountLockedAlert`에서 모달 오픈, 해제 성공 시 토스트 안내
  - (참고) 모달 열릴 때 인증코드 자동 발송을 시도했으나 프로젝트 lint 규칙(`react-hooks/set-state-in-effect`)에 걸려 "인증코드 받기" 버튼 클릭 방식으로 변경함
- [x] 실제 API 흐름과 안 맞았던 화면·빈 스캐폴딩 파일 정리 삭제 (`TempPasswordIssued.tsx` 등 5개, 이전 기록 참고)
- [ ] `GLOBAL_009`(refresh 재시도)/`GLOBAL_011`(다른 기기 로그인 모달) 공통 인터셉터 — 인증된 화면(마이페이지 등)을 만들 때 필요, 아직 없음
- [ ] 소셜 로그인 실제 연동 (버튼만 있고 동작 없음)
- [ ] 마이페이지 비밀번호 변경(인증코드 3단계 방식) — 이번 작업 범위 밖, 별도 화면 필요

## 다음 할 일

1. 백엔드 서버 켜고 전체 흐름(로그인 성공/실패, 아이디·비밀번호 찾기, 계정 잠금 해제) 실제 테스트
2. 이후 마이페이지 등 인증된 화면을 만들 때 `GLOBAL_009`/`GLOBAL_011` 공통 인터셉터 추가

## 막힌 점

- 없음

## 확인이 필요한 내용

- 백엔드 서버가 계속 꺼져 있어 실제 성공/실패 응답을 아직 못 봄 (지금까지는 코드 흐름과 네트워크 에러 처리만 확인)
- `/reset-password` 실제 이메일 링크로 끝까지(토큰 발급~임시비밀번호 메일 수신) 테스트 필요
- `UnlockAccountModal`은 실제 `AU_002` 응답이 있어야 열려서, 백엔드 없이는 끝까지 클릭 테스트 못 함 (타입체크·린트만 확인)
- `APP_FRONT_BASE_URL`이 실제로 `http://localhost:17000`으로 설정돼 있는지 — 문서 기본값 기준으로만 가정 중, 확인 안 됨

## 실행한 검증

- [x] 매 단계마다 `npx tsc --noEmit`, `npm run lint` 통과 확인
- [x] 브라우저로 로그인 / 아이디 찾기 / 비밀번호 찾기 1~3단계 / 새 비밀번호 등록 화면 렌더링·입력·버튼 클릭 확인 (네트워크 오류 처리 포함)
- [ ] 백엔드 서버 실제 기동 후 성공/실패 응답 확인 — 서버가 계속 꺼져 있어 미실행
- [ ] `UnlockAccountModal` 실제 동작 확인 — `AU_002` 응답 필요, 미실행

## 주의사항

- main과 develop에 직접 push하지 않습니다.
- commit, push, Pull Request 생성은 사용자가 직접 진행합니다.

작업이 완료되면 이 내용을 WORKLOG.md로 옮기고, STATE.md는 다음 작업 내용으로 교체합니다.
