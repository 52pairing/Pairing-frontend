/**
 * STOMP over WebSocket 공통 클라이언트 (앱 전역 싱글턴)
 *
 * 계약: docs/api/negotiation-realtime-frontend.md
 *  - 핸드셰이크 경로 `/ws`, 순수 WebSocket + STOMP (SockJS 미사용)
 *  - 인증: 로그인 시 발급된 accessToken "쿠키"로 자동 인증 (별도 헤더/쿼리 X)
 *  - 끊기면 5초 후 자동 재연결
 *
 * 재연결 시 등록된 구독을 자동으로 다시 붙이기 위해 구독 레지스트리를 둔다.
 */

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

// REST 기본 주소(http(s)://host)를 WebSocket 주소(ws(s)://host/ws)로 변환
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const resolveBrokerUrl = (): string => {
  // http → ws, https → wss (프로토콜 앞부분만 치환)
  const wsBase = API_BASE.replace(/^http/i, "ws");
  // 배포 ALB가 /api/* 만 백엔드로 라우팅해서 핸드셰이크 경로는 /api/ws 여야 한다.
  // (백엔드는 /ws 와 /api/ws 둘 다 열려 있어 로컬도 그대로 동작)
  return `${wsBase}/api/ws`;
};

interface Registration {
  topic: string;
  callback: (message: IMessage) => void;
  subscription: StompSubscription | null;
}

// 활성 구독 목록. 재연결(onConnect) 때 전부 다시 subscribe 한다.
const registrations = new Set<Registration>();

let client: Client | null = null;

const attachAllSubscriptions = (activeClient: Client) => {
  registrations.forEach((registration) => {
    registration.subscription = activeClient.subscribe(
      registration.topic,
      registration.callback,
    );
  });
};

/** 전역 STOMP 클라이언트를 가져온다(없으면 생성). */
export const getStompClient = (): Client => {
  if (client) return client;

  client = new Client({
    brokerURL: resolveBrokerUrl(),
    reconnectDelay: 5000,
    // 하트비트 10초/10초 — ALB idle timeout(60초) 대응. 서버와 값을 맞춘다.
    // (한쪽이 0이면 STOMP 규약상 양방향 모두 꺼지므로 명시)
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // 최초 연결과 재연결 모두에서 등록된 구독을 다시 붙인다.
    onConnect: () => {
      if (client) attachAllSubscriptions(client);
    },
  });

  return client;
};

/** 클라이언트를 활성화한다(로그인 후 1회, 이후 호출은 무시됨). */
export const activateStomp = (): void => {
  const activeClient = getStompClient();
  if (!activeClient.active) activeClient.activate();
};

/**
 * 토픽을 구독한다. 연결 전이면 레지스트리에만 등록해 두고
 * 연결 완료 시 자동으로 subscribe 된다. 반환된 함수로 구독 해제한다.
 */
export const subscribeTopic = (
  topic: string,
  callback: (message: IMessage) => void,
): (() => void) => {
  const activeClient = getStompClient();
  activateStomp();

  const registration: Registration = { topic, callback, subscription: null };
  registrations.add(registration);

  // 이미 연결돼 있으면 즉시 구독 (연결 전이면 onConnect 에서 처리)
  if (activeClient.connected) {
    registration.subscription = activeClient.subscribe(topic, callback);
  }

  return () => {
    registration.subscription?.unsubscribe();
    registrations.delete(registration);
  };
};
