"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getChatUnreadCount } from "@/features/chat/services/chatRooms";

// 헤더 채팅 배지 갱신 주기(ms).
// 채팅 STOMP는 방별 토픽이라 다른 화면에 있을 때는 전역 배지에 쓸 수 없어,
// 어느 화면에서든 동작하도록 안읽은 총합을 주기적으로 폴링한다.
const POLL_INTERVAL_MS = 20_000;

/**
 * 헤더 채팅 아이콘 배지에서 쓰는 안읽은 1:1 채팅 메시지 총합.
 * 진입 시 REST로 조회하고, 이후 주기적 폴링과 창 포커스 복귀 시 재조회한다.
 */
export const useUnreadChatCount = (accountId: number | undefined) => {
  const [count, setCount] = useState(0);
  const accountIdRef = useRef(accountId);

  const refresh = useCallback(() => {
    if (!accountIdRef.current) return;

    getChatUnreadCount()
      .then((result) => setCount(result.unreadCount))
      .catch(() => {
        // 헤더 배지는 부가 정보라 일시적 조회 실패 시 직전 값을 유지한다.
      });
  }, []);

  useEffect(() => {
    accountIdRef.current = accountId;

    if (!accountId) {
      // 이펙트 본문에서 동기 setState를 피하기 위해 마이크로태스크로 미룬다.
      let cancelled = false;
      Promise.resolve().then(() => {
        if (!cancelled) setCount(0);
      });
      return () => {
        cancelled = true;
      };
    }

    refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);

    // 다른 탭/창에 있다가 돌아오면 폴링 주기를 기다리지 않고 즉시 갱신한다.
    const handleVisible = () => {
      if (document.visibilityState !== "hidden") refresh();
    };
    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [accountId, refresh]);

  return count;
};
