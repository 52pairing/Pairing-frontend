# STATE

## 현재 작업 (2026-08-13 — 채팅 단위·컴포넌트 테스트)

- 작업명: 채팅방 목록·상세·메시지·실시간 구독 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 서비스·STOMP 훅·채팅 컴포넌트 테스트 작성 완료
- 검증: 채팅 3 suites/14 tests, 전체 23 suites/110 tests, TypeScript, 변경 파일 ESLint, `git diff --check` 통과
- 실제 API·STOMP·브라우저: Mock 기반 테스트 범위이므로 미검증

---

## 현재 작업 (2026-08-13 — 계약 도메인 구조 정리)

- 작업명: 계약 컴포넌트 공통·프리랜서·클라이언트 3분류 통합
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 흩어진 계약 컴포넌트와 클라이언트 전용 서비스·타입을 `src/features/contract` 아래로 통합 완료
- 검증: 계약 관련 테스트 6 suites, 31 tests 통과; 변경 파일 ESLint 및 `git diff --check` 통과
- TypeScript: 실패 — 기존 프리랜서 마이페이지의 미설치 `lucide-react` import 2건
- 실제 브라우저·API: 경로 이동만 수행하여 미검증

---

## 현재 작업 (2026-08-13 — 1:1 채팅 최종 API 재연동)

- 작업명: 1:1 채팅 목록·상세·메시지·실시간 API 연동
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 작업 브랜치
- 진행 상황: 최종 매핑 기준 `/chat-rooms` REST, 계약 합의안, STOMP 사용자 판정 연동 완료
- 검증: 채팅 변경 파일 ESLint, `git diff --check` 통과
- TypeScript: 실패 — 기존 프리랜서 마이페이지의 `lucide-react` 모듈 해석 오류 2건
- 실제 API·STOMP·브라우저: 인증 가능한 테스트 계정이 없어 미검증
- 백엔드 최종 회신 반영: 프로필은 PR #199 이후 절대 URL, `ACTIVE | CLOSED`, nullable 상대·프로젝트, 이미지 로드 실패 폴백, STOMP messageId 중복 제거 적용
- `GET /api/v1/chat-rooms` 500 해결 완료: PostgreSQL 쿼리 파라미터 타입 추론 서버 버그 수정·배포 후 200 및 채팅방 9건 확인. 프론트 수정 사항 없음
- 프로필 이미지는 CloudFront 절대 URL로 반환되며 현재 데이터는 대부분 null이라 첫 글자 폴백 유지

---

## 현재 작업 (2026-08-13 — 프리랜서 계약 테스트)

- 작업명: 프리랜서 내 계약 목록·상세 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 브랜치 사용 중
- 진행 상황: 관련 테스트 3 suites, 19 tests 통과
- 전체 테스트: 18 suites, 88 tests 통과
- 검증: 변경 파일 ESLint, `git diff --check` 통과
- TypeScript: 사용자 측 프리랜서 마이페이지 코드의 미설치 `lucide-react` import 2건으로 실패
- 빌드: TypeScript 선행 오류로 미실행
- 실제 계약·PDF·정산 API 및 브라우저: 미검증

---

## 현재 작업 (2026-08-13 — FAQ 챗봇 테스트)

- 작업명: 고객지원 FAQ 챗봇 단위·컴포넌트 테스트 작성
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 브랜치 사용 중
- 진행 상황: 챗봇 관련 테스트 2 suites, 12 tests 통과
- 검증: 변경 파일 ESLint, `git diff --check` 통과
- 전체 테스트: 15 suites, 69 tests 전체 통과 — `FreelancerProfile` 테스트를 현재 인라인 버튼 UI에 맞게 갱신
- TypeScript: 실패 — 사용자 측 프리랜서 마이페이지 코드의 미설치 `lucide-react` import 2건
- 전체 ESLint: 오류 0건, 기존 warning 2건
- 빌드: TypeScript 선행 오류로 미실행
- 실제 API·브라우저: 미검증

---

## 현재 작업 (2026-08-13)

- 작업명: 알림 센터 실제 API/STOMP 연동
- 기준 문서: `frontend-notification-integration.md` (카카오톡 전달본), 회원 탈퇴는 `frontend-withdrawal-integration.md` 대조만 수행
- 작업 목적: 알림 목록·안읽음 개수·읽음·삭제 REST와 `/topic/users/{accountId}/notifications` STOMP 실시간 수신을 헤더 배지·알림함 화면에 연동합니다. 기존 디자인은 유지합니다.

## 완료 범위

- 회원 탈퇴: 신규 가이드 대조 결과 기존 구현(2026-08-13 회원 탈퇴 프론트 연동)이 이미 blockers 포맷·에러코드(`AC_008`~`AC_011`, `GLOBAL_002`)를 그대로 만족해 추가 변경 없음
- 알림: 목데이터를 실제 REST(`/api/v1/notifications`, `unread-count`, `read`, `read-all`, 삭제/전체삭제)로 교체
- 알림: 매칭 전용 STOMP 구독과 별개로 전체 타입을 수신하는 일반 알림 STOMP 구독 추가, 헤더 종 배지에 실제 안읽음 수 연결
- `CONTRACT_CREATED`/`CONTRACT_SIGNED`의 `linkUrl`(`/contracts/{contractId}`)이 실제 라우트에 없어, 매칭 알림 리다이렉트와 동일한 패턴으로 역할별 상세로 보내는 리다이렉트 페이지 추가

## 미검증·확인 필요

- 가이드 문서에 `NEGOTIATION_STARTED`/`NEGOTIATION_PROPOSED`/`NEGOTIATION_FAILED`, `SETTLEMENT_DUE`의 실제 `linkUrl` 형식이 명시돼 있지 않아 서버가 내려주는 값을 그대로 이동시킵니다. 실제 협상방·정산 경로와 다를 수 있어 확인이 필요합니다.
- 실제 로그인 세션·STOMP 연결로 알림 수신, 배지 증가, 재연결 시 목록 재조회는 테스트 계정이 없어 확인하지 못했습니다.
- 회원 탈퇴 안내 문구(`blockers[].linkUrl`)가 가리키는 `/negotiations`, `/my-projects`, `/mypage/settlements`, `/contracts` 같은 공용 경로는 앱에 아직 없습니다(기존 구현부터 있던 차이이며 이번 작업 범위 밖).
