"use client";

import { useEffect, useState } from "react";

import {
  getCachedCurrentUser,
  getCurrentUser,
  seedCurrentUser,
} from "@/features/auth/services/currentUser";
import type { CurrentUserResponse } from "@/features/auth/types";

// 헤더에서 현재 로그인 사용자의 역할과 이름을 표시할 때 사용합니다.
// initialUser: 서버에서 미리 조회한 사용자. 첫 렌더부터 올바른 헤더를 그려 깜빡임을 막습니다.
export const useCurrentUser = (initialUser: CurrentUserResponse | null = null) => {
  return useCurrentUserState(initialUser).user;
};

// 헤더처럼 사용자 조회 중 상태를 별도로 표시해야 하는 화면에서 사용합니다.
export const useCurrentUserState = (initialUser: CurrentUserResponse | null = null) => {
  const [user, setUser] = useState<CurrentUserResponse | null>(() => {
    // 서버가 넘긴 initialUser를 공유 모듈 캐시에 1회 시드해, 같은 화면의 가드가
    // /auth/me를 다시 조회하지 않도록 한다. (null이면 시드하지 않음 — 로그인으로 오인 금지)
    if (initialUser) seedCurrentUser(initialUser);
    return initialUser ?? getCachedCurrentUser();
  });
  const [isLoading, setIsLoading] = useState(
    () => initialUser === null && getCachedCurrentUser() === null,
  );

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((result) => {
        if (!cancelled) {
          setUser(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        // 인증 실패 처리는 기존 페이지 흐름에 맡기고 헤더는 기본 역할명으로 표시합니다.
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading };
};
