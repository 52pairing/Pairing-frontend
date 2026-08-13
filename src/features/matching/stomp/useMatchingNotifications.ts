"use client";

import { useEffect } from "react";
import type { IMessage } from "@stomp/stompjs";
import { subscribeTopic } from "@/features/negotiation/stomp/client";
import type { MatchingNotification } from "@/features/matching/types/matching";

export const useMatchingNotifications = (accountId: number | undefined, onNotification: (notification: MatchingNotification) => void) => {
  useEffect(() => {
    if (!accountId) return;
    const handleMessage = (message: IMessage) => {
      try { onNotification(JSON.parse(message.body) as MatchingNotification); } catch { /* malformed events are ignored */ }
    };
    return subscribeTopic(`/topic/users/${accountId}/notifications`, handleMessage);
  }, [accountId, onNotification]);
};
