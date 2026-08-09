"use client";

import { useEffect, useState } from "react";

import { getCurrentUser } from "@/features/auth/services/currentUser";
import type { CurrentUserResponse } from "@/features/auth/types";

// 헤더에서 현재 로그인 사용자의 역할과 이름을 표시할 때 사용합니다.
export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((result) => {
        if (!cancelled) setUser(result);
      })
      .catch(() => {
        // 인증 실패 처리는 기존 페이지 흐름에 맡기고 헤더는 기본 역할명으로 표시합니다.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
};
