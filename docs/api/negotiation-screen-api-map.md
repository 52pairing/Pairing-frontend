# 협상 와이어프레임 ↔ API/모달 매핑

> 와이어프레임 프레임 순서대로. 각 화면의 버튼/요소에 어떤 API·STOMP·모달을 붙이는지.
> 표기: 🔵 REST · 📡 STOMP(실시간) · 🪟 모달 · ➡️ 화면이동
> 상세 필드는 api-dto_FINAL 참조.

---

## 0. 헤더 종 배지 (전역, 모든 화면 공통)
프레임: 상단 헤더 우측 종 아이콘

| 요소 | 매핑 |
| --- | --- |
| 종 옆 **숫자 배지** | 🔵 `GET /api/v1/negotiations/waiting-count` → `{ "waitingCount": 2 }`. **0이면 배지 숨김** |
| 갱신 시점 | ① 로그인 직후 ② `POST /negotiations/{id}/read` 호출 뒤 ③ 📡 `/topic/negotiations/{id}` 로 새 제안 이벤트 수신 시 |
| 배지 클릭 | ➡️ 협상 목록(`/negotiations/mine`) |

> 판정 기준은 목록의 `waitingForMe` 와 **동일**(진행 중 + 이번 라운드 AI 제안에 내 응답이 아직 없음)이라, 헤더 숫자와 목록의 "내 응답 필요" 개수가 항상 일치한다.
> 목록(`/mine`)은 페이징이라 프론트가 1페이지만 받아 세면 숫자가 실제보다 작아진다. **반드시 이 API 를 쓸 것.**
> 클라·프리 양쪽 역할인 계정은 합산된다.

---

## 1. 클라 협상 탭 (후보 목록) — "내 프로젝트 > 협상"
프레임: `협상`, `매칭 요청 페이지`

| 요소 | 매핑 |
| --- | --- |
| 화면 진입(후보 카드 목록) | 🔵 `GET /api/v1/negotiations/mine?projectId={id}` → 카드별 status·라운드 X/15·lastProposalBy·lastProposalAt |
| 카드 배지 "수락/요청대기/거절/협상중/내 응답 필요/상대방 응답 대기" | status + `waitingForMe`(내 응답 필요 vs 상대 대기) |
| 카드/탭 **빨간점**(안 읽은 새 제안) | `newProposalCount > 0`. 협상방 진입 시 🔵 `POST /api/v1/negotiations/{id}/read` 로 끔 |
| "마지막 제안: 프리랜서/클라이언트/AI · N분 전" | lastProposalBy / lastProposalAt |
| [협상 시작] (아직 마지노선 전) | ➡️ 협상 상세로 이동 → `GET /api/v1/negotiations/{id}` |
| [협상방 입장] (라운드 진행 중) | ➡️ 협상 상세(로그)로 이동 |
| [프로필] | ➡️ 후보 프로필(매칭 도메인) `GET /matchings/... candidate` |
| 실시간 카드 갱신(새 제안/타결) | 📡 `/topic/negotiations/{id}` 구독 → 배지·라운드 갱신 |

## 2. 클라 협상 탭 — 프리랜서 모두 거절 시
프레임: `협상_프리랜서 모두 거절 시`

| 요소 | 매핑 |
| --- | --- |
| 안내 배너 "모든 추천 프리랜서가 거절…" | 클라 화면 조건부 표시(전원 거절 시) |
| [무료 재추천] | 🔵 `POST /matchings/positions/{positionId}/rerecommendations` (type=FREE) — 매칭 도메인 |
| [재추천 요청] (유료) | 🔵 동 endpoint (type=PAID, 1인당 1만원) → 🪟 결제 모달 |

## 3. 협상 상세 진입 + 마지노선 입력 (프리/클라 공통)
프레임: `FLHeader`(연봉 320만/근무 상시 초기 카드 + 우측 floor 입력)

| 요소 | 매핑 |
| --- | --- |
| 초기 제안 조건 카드(연봉/근무형태/기간) | `GET /api/v1/negotiations/{id}` → conditions[].clientValue(=클라 희망) |
| floor 입력 필드 "최소 연봉/허용 근무형태/최소 기간" | 입력값 = 내 마지노선 |
| 힌트 "상대 희망 XXX / 클라이언트 희망 XXX" | conditions[].clientValue/freelancerValue (상대 희망값, 공개) |
| "상대가 적은 값은 보이지 않아요" | 상대 floor는 응답에 없음(비공개) |
| **[협상 시작]** | 🔵 `POST /api/v1/negotiations/{id}/start` body `{conditions:[{conditionType, value}]}` → 내 마지노선 저장 + **두 대리인 A2A 왕복 실행**(4번 로그 생성) → 합의 조건 자동 락, 나머지는 승인 대기 |

## 4. AI 협상 로그 (진행 중) — A2A 대화 (두 대리인)
프레임: `FLHeader`(조건 배지 + 라운드 3/15 + 메시지들)

> **A2A 확정**: 로그는 **클라이언트 AI(CLIENT_AGENT) ↔ 프리랜서 AI(FREELANCER_AGENT)** 두 대리인이 제안·역제안·수락을 주고받는 대화다(중재자 1개 아님). 각 메시지에 근거(reason) 필수. 대리인끼리 합의한 조건은 자동 락🔒, 나머지는 사람 승인/재지시(5·6번).

| 요소 | 매핑 |
| --- | --- |
| 로그 최초 로드 | 🔵 `GET /api/v1/negotiations/{id}/messages` → message.senderType = `CLIENT_AGENT`/`FREELANCER_AGENT`(대리인) · `CLIENT`/`FREELANCER`(사람 응답) · `SYSTEM`(안내) |
| 발신자 좌/우 배치 | senderType 이 내 편 대리인이면 우측, 상대 대리인이면 좌측 |
| 실시간 새 제안/역제안 도착 | 📡 `/topic/negotiations/{id}` (NegotiationEvent type=NEW_PROPOSAL·ANSWERED) |
| 상단 조건 배지 "진행중🟡 / 합의🔒" | conditions[].status (PENDING/AGREED) — 대리인 자동 합의 시 AGREED |
| 라운드 3/15 | totalRound / maxRound(15). 라운드 = start·재지시(다시 협상) 1회당 1증가 |
| 메시지 근거 텍스트 | message.reason (필수) + message.proposedValue(제시값) |
| "응답 중…" 타이핑 표시 | (FE 연출용, 백엔드 이벤트 없음) |
| 헤더 [협상 포기] | 🪟 포기 모달(→ 8번) |

## 5. 조건 승인 패널 (사람 개입)
프레임: `FLHeader`(연봉[수락][거절] / 기간[수락][거절] / 근무형태[이미 합의])

| 요소 | 매핑 |
| --- | --- |
| 조건별 [수락] | answers[].accepted=true |
| 조건별 [거절] | answers[].accepted=false (→ 재지시 필요) |
| [이미 합의🔒] (락된 조건) | conditions[].status=AGREED (버튼 비활성) |
| **[확인]** | 🔵 `POST /api/v1/negotiations/{id}/answers` body `{roundNo, answers:[{conditionId, accepted, proposedValue}]}` |

## 6. 재지시 패널 (거절 조건 마지노선 재조정)
프레임: `FLHeader`(연봉/기간 "재협상 필요" + "직전 마지노선: XXX" + 새 최소값 입력)

| 요소 | 매핑 |
| --- | --- |
| "재협상 필요"/"대립적 필요" 배지 | conditions[].status = **REJECTED** |
| "직전 마지노선: 350만원 이상" | conditions[].**myFloor** (내 것만) |
| "새 최소 금액/개월 수" 입력 | 새 마지노선 |
| "합의 완료🔒" (다른 조건) | status=AGREED |
| **[다시 협상]** | 🔵 `POST /api/v1/negotiations/{id}/answers` — 거절 조건 proposedValue=새 마지노선 (재지시 흡수) |
| [협상 포기] | 🪟 포기 모달(→ 8번) |

## 7. 조건 승인/재지시 — 클라 측 (대칭)
프레임: `FLHeader`(클라뷰, 동일 UI). 5·6번과 동일 API, viewerRole만 다름.

## 8. 협상 포기 모달 🪟
프레임: `FreelancerDashboardPage`("협상을 포기하시겠어요?")

| 요소 | 매핑 |
| --- | --- |
| 모달 문구(NEGOTIATION_FAILED, 재추천 제외, 무료 리롤 미포함, 유료 리롤 1만원) | 정적 안내 |
| [취소] | 🪟 닫기 |
| **[협상 포기]** | 🔵 `POST /api/v1/negotiations/{id}/give-up` body `{reason}` → status=FAILED, 상대 알림 |

## 9. 결렬 결과 화면
프레임: `FLHeader`("협상이 성립되지 않았어요. 15회 소진 또는 협상 포기로 종료")

| 요소 | 매핑 |
| --- | --- |
| 결렬 카드 | `GET /api/v1/negotiations/{id}` status=FAILED. **15회 소진 시 자동 결렬**(별도 승인 없음) |
| 실시간 결렬 도달 | 📡 `/topic/negotiations/{id}` (NegotiationEvent type=FAILED) |
| [돌아가기] | ➡️ 협상 목록 |

## 10. 타결 화면 (모든 조건 합의)
프레임: `FLHeader`("모든 조건 합의" + 락된 조건 칩 + [채팅으로 이어가기])

| 요소 | 매핑 |
| --- | --- |
| "모든 조건 합의" 카드 + 조건 칩(연봉/근무형태/기간🔒) | status=AGREED, conditions[].agreedValue |
| 실시간 타결 도달 | 📡 `/topic/negotiations/{id}` (type=AGREED) |
| **[채팅으로 이어가기]** | ➡️ 사람 채팅방 → `chatRoomId` / `GET /api/v1/chat-rooms/{chatRoomId}/messages` (13. Chat) |
| 채팅 실시간 | 📡 `/topic/chat-rooms/{chatRoomId}` |

> ⚠️ **채팅방은 타결이 아니라 계약 체결 시 생긴다** (2026-08-10 변경). 타결 직후에는 `chatRoomId` 가 **null** 이므로
> **[채팅으로 이어가기] 버튼은 `chatRoomId != null` 일 때만 노출**할 것. 그 전에는 "계약 체결 후 대화를 시작할 수 있어요" 안내로 대체.
> 계약이 체결되면 방이 생기면서 입력창까지 바로 열린다(잠긴 방 단계 없음).

---

## 모달(🪟) 정리 — 어디에 다냐
| 모달 | 트리거 위치 | 확정 버튼 API |
| --- | --- | --- |
| 협상 포기 확인 | 협상 상세 헤더 [협상 포기] (진행 중 상시) | `POST /negotiations/{id}/give-up` |
| 유료 재추천 결제 | 협상 탭 [재추천 요청] (전원 거절 시) | `POST /matchings/positions/{id}/rerecommendations` (매칭) |

> 승인/재지시는 모달이 아니라 **로그 하단 인라인 패널**(대화창 스레드)로 붙는다 — 독립 페이지 X.
> 조건 diff(안 맞는 조건 추림)는 negotiation 생성 시 백엔드가 자동 → 화면은 이미 추려진 conditions만 렌더.
