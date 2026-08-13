"use client";

import { useEffect, useRef } from "react";
import type { IMessage } from "@stomp/stompjs";
import { onStompConnect, subscribeTopic } from "@/features/negotiation/stomp/client";
import type { NotificationItem } from "@/features/notification/types/notification";

// 실시간 push payload는 알림 객체와 같지만 방금 온 알림이라 read 필드가 없다.
type NotificationPushPayload = Omit<NotificationItem, "read">;

interface UseNotificationStreamOptions {
  /** 최초 연결이 아닌 재연결일 때(끊긴 동안 못 받은 알림이 있을 수 있음) 호출된다. */
  onReconnect?: () => void;
}

/**
 * `/topic/users/{accountId}/notifications`를 구독해 전체 타입의 실시간 알림을 수신한다.
 * 매칭 전용 `useMatchingNotifications`와 별개로, 알림함·헤더 배지에서 전체 타입을 다루기 위해 사용한다.
 */
export const useNotificationStream = (
  accountId: number | undefined,
  onNotification: (notification: NotificationItem) => void,
  { onReconnect }: UseNotificationStreamOptions = {},
) => {
  const hasConnectedOnceRef = useRef(false);

  useEffect(() => {
    hasConnectedOnceRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!accountId) return;

    const handleMessage = (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as NotificationPushPayload;
        onNotification({ ...payload, read: false });
      } catch {
        // 형식이 다른 이벤트는 무시한다.
      }
    };

    const unsubscribeTopic = subscribeTopic(
      `/topic/users/${accountId}/notifications`,
      handleMessage,
    );

    const unsubscribeConnect = onReconnect
      ? onStompConnect(() => {
          if (hasConnectedOnceRef.current) {
            onReconnect();
          }
          hasConnectedOnceRef.current = true;
        })
      : undefined;

    return () => {
      unsubscribeTopic();
      unsubscribeConnect?.();
    };
  }, [accountId, onNotification, onReconnect]);
};
