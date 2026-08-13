"use client";

import { useCallback, useEffect, useState } from "react";

import { getUnreadNotificationCount } from "@/features/notification/services/notification";
import { useNotificationStream } from "@/features/notification/stomp/useNotificationStream";

/**
 * 헤더 종 배지에서 쓰는 안읽은 알림 개수.
 * 최초 진입 시 REST로 조회하고, 이후 실시간 알림이 오면 재조회 없이 +1 한다.
 */
export const useUnreadNotificationCount = (accountId: number | undefined) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!accountId) {
      Promise.resolve().then(() => {
        if (!cancelled) setCount(0);
      });
      return () => {
        cancelled = true;
      };
    }

    getUnreadNotificationCount()
      .then((result) => {
        if (!cancelled) setCount(result.unreadCount);
      })
      .catch(() => {
        // 헤더 배지는 부가 정보라 조회 실패 시 0으로 둔다.
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  const handleNotification = useCallback(() => {
    setCount((current) => current + 1);
  }, []);

  useNotificationStream(accountId, handleNotification);

  return count;
};
