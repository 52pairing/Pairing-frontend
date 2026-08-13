# STATE

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
