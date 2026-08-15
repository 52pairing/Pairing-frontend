"use client";

/**
 * 협상방 실시간 구독 훅
 *
 * 협상방 화면 마운트 시 `/topic/negotiations/{id}` 를 구독하고,
 * 언마운트 시 해제한다. (docs/api/negotiation-realtime-frontend.md §3)
 * STOMP 는 버튼이 아니라 "화면"에 붙는 백그라운드 구독이다.
 */

import { useEffect, useRef } from "react";

import { subscribeTopic } from "@/features/negotiation/stomp/client";
import type { NegotiationEvent } from "@/features/negotiation/types/negotiation";

export const useNegotiationEvents = (
  negotiationId: number | string | null | undefined,
  onEvent: (event: NegotiationEvent) => void,
): void => {
  // 콜백 변경이 재구독을 유발하지 않도록 ref 로 최신 핸들러 유지
  const handlerRef = useRef(onEvent);
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (negotiationId == null || negotiationId === "") return;

    const unsubscribe = subscribeTopic(
      `/topic/negotiations/${negotiationId}`,
      (message) => {
        try {
          const event = JSON.parse(message.body) as NegotiationEvent;
          handlerRef.current(event);
        } catch {
          // payload 파싱 실패는 무시 (미검증 payload 방어)
        }
      },
    );

    return unsubscribe;
  }, [negotiationId]);
};
