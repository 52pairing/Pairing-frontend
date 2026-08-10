# STATE

이 문서는 현재 AI와 함께 진행 중인 한 가지 작업만 기록합니다.

## 현재 작업

- 작업명: 협상(negotiation) 도메인 연동 — 기반 + 협상방
- 관련 Issue: 확인 필요
- 관련 브랜치: 현재 브랜치
- 작업 목적: 백엔드 협상 도메인 계약(REST + STOMP)에 맞춰 기반 계층과 협상방 화면을 실데이터/실시간으로 연동합니다.

## 계약 문서 (기준)

- `docs/api/negotiation-realtime-frontend.md` — STOMP over WebSocket 실시간 계약
- `docs/api/negotiation-screen-api-map.md` — 화면 ↔ API/모달/STOMP 매핑
- 필드 계약은 **백엔드 확정 답변(2026-08)** 으로 확정했고, 세부 사항은 `.ai/API.md`의 "협상 도메인" 참고. **실제 네트워크 응답만 미검증.**

## 이번 작업 범위 (확정: 기반 + 협상방 먼저)

- 협상 컴포넌트를 공용 `src/features/negotiation`으로 이동 (client 전용 → 양쪽 대칭 대비)
- `@stomp/stompjs` 도입 (팀 합의 확인됨)
- 협상 타입 정의 (계약 기반, 미검증 필드 표기)
- 협상 REST 서비스 계층 (상세/메시지/시작/승인·재지시/포기/read/대기건수)
- STOMP 클라이언트 싱글턴 + 협상방 구독 훅
- 협상방(NegotiationRoom): GET 상세+메시지 로드, `/topic/negotiations/{id}` 구독, 이벤트별 재조회, 시작/승인·재지시/포기 액션, 타결/결렬 화면, 채팅 이어가기 게이팅

## 진행 상황

- [x] 계약 문서 `docs/api`에 보관
- [x] `@stomp/stompjs ^7.3.0` 설치 (package.json)
- [x] 컴포넌트 7종 `src/features/negotiation/components`로 이동, 참조 2곳 갱신
      (app 라우트 page, `ClientProjectDetail`)
- [x] 타입: `src/features/negotiation/types/negotiation.ts`
- [x] 서비스: `src/features/negotiation/services/negotiation.ts`
- [x] STOMP: `src/features/negotiation/stomp/client.ts`, `useNegotiationEvents.ts`
- [x] 협상방 컨테이너 실데이터/실시간 연동 (`NegotiationRoom.tsx`)
- [x] 대화 플로우 데이터 구동화 (`NegotiationChatFlow.tsx`) + 결과 카드 확장
- [x] 협상방 라우트 `[negotiationId]` 동적 세그먼트로 전환, room 이 `useParams` 로 수신
      (경로: `/client/projects/{projectId}/negotiation/{negotiationId}`)
- [x] 협상 목록 연동: `getMyNegotiations`(GET `/negotiations/mine`), `ProjectNegotiation` 실데이터,
      `CandidateCard` 협상용 재설계(상태·라운드·마지막 제안·빨간점) + 협상방 링크
- [x] 헤더 종 배지 연동: `useWaitingCount`(GET `/negotiations/waiting-count`) → `Header` 에서
      `ClientHeader`/`FreelancerHeader` 종(알림) 배지 count 주입, 0이면 숨김
- [x] TypeScript(`npx tsc --noEmit`) 통과
- [x] 변경 파일 ESLint 통과
- [x] 협상방 역할 대응(뒤로가기 경로를 `usePathname`로 client/freelancer 판별)
- [x] 프리랜서 협상방 라우트 신설(`/freelancer/projects/{projectId}/negotiation/{negotiationId}`, `NegotiationRoom` 재사용)
- [ ] 브라우저 화면 및 실제 API/STOMP 확인
- [ ] 전역 STOMP 활성화(로그인 후 1회) 및 `/user/queue/notifications` 전역 구독
- [ ] 프리랜서 협상 진입(매칭 수락/거절·받은 요청 목록) — **매칭 도메인 계약 필요**

## 실행한 검증

- [x] `npx tsc --noEmit`
- [x] 변경 파일 ESLint
- [ ] 브라우저 확인 (사용자 선호: 로컬 브라우저 검증 생략)
- [ ] 실제 REST 요청·응답 확인
- [ ] 실제 STOMP 연결·이벤트 수신 확인

## 남은 확인/결정 (백엔드 답변 반영 후)

- 실제 네트워크 응답·STOMP 연결 검증 (전 항목 미검증)
- (확정) `WORK_FORM`=FULL_TIME/PART_TIME/ANY, 값 라벨은 meta API(`getWorkConditionsMeta`)로 해결
- (확정) 협상방은 매칭 수락(`POST /matchings/requests/{id}/acceptance`) 시 자동 생성 → 프리랜서 현황 버튼은 `status==="NEGOTIATING"` 기준
- (결정) 알림=협상방 가기 버튼 빨간점만(헤더 종 제거) · 타결 후 채팅 `/chat`
- 조건 종류별 입력 UI 보강(금액=만원 외 기간/근무방식/시작일 전용 위젯) — 후속
- 프리랜서 측 대칭 화면, 전역 STOMP(실시간 자동 갱신) — 후속
- WS 배포 CORS: 프론트 오리진 확정 후 백엔드 `CORS_ALLOWED_ORIGINS` 등록 요청(REST+WS 공용), 쿠키 `SameSite=None; Secure`, `*` 불가

## 주의사항

- 협상 도메인 계약은 `docs/api/negotiation-*.md`를 기준으로 확인합니다.
- 실제 응답을 확인하지 못한 필드는 추측하지 않고 미검증으로 표기했습니다.
- STOMP 구독은 협상방 화면 마운트/언마운트에만 붙입니다(버튼 아님).
- commit, push, Pull Request 생성은 사용자 요청 없이 수행하지 않습니다.
