# 실시간(STOMP) 연동 가이드 — 프론트엔드용

> 협상/채팅/알림 실시간은 REST가 아니라 **STOMP over WebSocket**이라 Swagger에 안 뜬다. 이 문서가 그 계약이다.
> REST(스웨거)로 초기 상태를 그리고, STOMP로 "그 이후 바뀌는 것"만 실시간으로 받는다. **초기=GET, 이후=STOMP** 짝.

## 1. 연결 (한 번만)
- **핸드셰이크 경로**: `/ws` (예: `ws://localhost:8080/ws`)
- **인증**: 로그인 시 발급된 **`accessToken` 쿠키로 자동 인증**. 별도 헤더/쿼리 파라미터 X.
  - 쿠키 기반이라 **같은 오리진**으로 연결해야 쿠키가 실린다(크로스 오리진이면 쿠키 전송 설정 필요).
  - 쿠키 없으면 핸드셰이크 거절됨.
- **SockJS 안 씀** → 순수 WebSocket + STOMP 클라이언트 사용(`@stomp/stompjs`).
- 브로커 prefix: 구독 = `/topic`·`/user/queue`, 전송 = `/app`.

```ts
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: `ws://localhost:8080/ws`, // 배포 시 wss://
  reconnectDelay: 5000,                // 끊기면 자동 재연결
  onConnect: () => { /* 여기서 subscribe */ },
});
client.activate(); // 로그인 후 앱 전역에서 1번
```

## 2. 구독 토픽 (무엇을 어디서 받나)
| 토픽 | 언제 | payload |
| --- | --- | --- |
| `/topic/negotiations/{negotiationId}` | 협상방 화면에 있을 때 | `NegotiationEvent` |
| `/topic/chat-rooms/{chatRoomId}` | AI Out 후 사람 채팅방 | `ChatMessageResponse` |
| `/user/queue/notifications` | 로그인 내내(전역) | `NotificationResponse` |

## 3. 협상방에서 — 언제 구독/해제
STOMP는 버튼이 아니라 **화면(협상방)에 붙이는 백그라운드 구독**이다.

```
협상방 진입:
  1) GET /api/v1/negotiations/{id}            → 헤더 배지·라운드·조건 (초기 상태)
  2) GET /api/v1/negotiations/{id}/messages   → 로그 (초기)
  3) subscribe /topic/negotiations/{id}       ← 여기! 이후 변화만 실시간

협상방 이탈:
  4) unsubscribe (구독 해제)
```

```ts
// 협상방 마운트 시
const sub = client.subscribe(`/topic/negotiations/${negotiationId}`, (msg) => {
  const evt = JSON.parse(msg.body); // NegotiationEvent
  // evt.type 에 따라 화면 갱신 (아래 표)
});
// 협상방 언마운트 시
sub.unsubscribe();
```

## 4. NegotiationEvent — 받아서 뭘 하나
| 필드 | 값 |
| --- | --- |
| `type` | `NEW_PROPOSAL` / `CONDITION_LOCKED` / `AGREED` / `FAILED` |
| `negotiationId` | 협상 ID |
| `conditionId` | 대상 조건(조건 무관 이벤트는 null) |
| `status` | `IN_PROGRESS` / `AGREED` / `FAILED` |
| `totalRound` | 라운드 수 |
| `occurredAt` | 발생 시각 |

| type | 화면 반응 |
| --- | --- |
| `NEW_PROPOSAL` | 새 제안 메시지 추가(로그 append), 라운드 X/15 갱신, "응답 중…" 해제 |
| `CONDITION_LOCKED` | 상단 조건 배지 → 합의🔒, 승인 패널에서 해당 조건 [이미 합의] 처리 |
| `AGREED` | 타결 화면으로 전환("모든 조건 합의" + [채팅으로 이어가기]) |
| `FAILED` | 결렬 화면으로 전환("협상이 성립되지 않았어요") |

> 이벤트가 오면 화면만 갱신하면 되고, 굳이 GET 다시 안 해도 된다. 놓친 게 걱정되면(재접속 등) GET /messages 로 재동기화.

## 5. 화면별 요약 — REST + STOMP 조합
| 화면 | 초기(REST/스웨거) | 실시간(STOMP) |
| --- | --- | --- |
| 협상 탭 카드 목록 | `GET /negotiations/mine?projectId=` | (선택) 없어도 됨. 재진입 시 재조회 |
| 협상방(로그/승인/재지시) | `GET /negotiations/{id}` + `/messages` | `/topic/negotiations/{id}` |
| AI Out 사람 채팅 | `GET /chat-rooms/{id}/messages` | `/topic/chat-rooms/{id}` |
| 헤더 알림/메시지 뱃지 | `GET /notifications/unread-count` 등 | `/user/queue/notifications` |

## 6. 주의
- **STOMP는 협상방 화면에만** 구독/해제(들어갈 때 구독, 나갈 때 해제). 버튼마다 붙이는 거 아님.
- 알림(`/user/queue/notifications`)만 로그인 내내 전역 구독.
- 사용자가 보내는 사람 채팅은 REST `POST /chat-rooms/{id}/messages`로 저장 → 서버가 그 방 토픽으로 broadcast(상대가 실시간 수신). 내 화면은 낙관적 렌더 or 브로드캐스트 반영.
- 채팅 토픽 경로(`/topic/chat-rooms/{id}` vs `/topic/chat/rooms/{id}`)는 채팅 도메인 구현과 최종 일치시킬 것.
