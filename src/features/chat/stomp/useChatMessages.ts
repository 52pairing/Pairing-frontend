"use client";

import { useEffect, useRef } from "react";

import type { ChatMessageBroadcast } from "@/features/chat/types/chat";
import { subscribeTopic } from "@/features/negotiation/stomp/client";

export const useChatMessages = (
  chatRoomId: number | null,
  onMessage: (message: ChatMessageBroadcast) => void,
): void => {
  const handlerRef = useRef(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (chatRoomId == null) return;

    return subscribeTopic(`/topic/chat-rooms/${chatRoomId}`, (frame) => {
      try {
        handlerRef.current(JSON.parse(frame.body) as ChatMessageBroadcast);
      } catch {
        // 잘못된 broadcast 한 건이 현재 구독을 중단시키지 않도록 무시한다.
      }
    });
  }, [chatRoomId]);
};
