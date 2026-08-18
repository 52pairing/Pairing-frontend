import { cache } from "react";
import { headers } from "next/headers";

import type { CurrentUserResponse } from "@/features/auth/types";

// 백엔드 성공 응답 형식 (lib/api의 ApiSuccessBody와 동일 구조)
interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * 서버 렌더 시점에 인증 쿠키로 현재 로그인 사용자를 조회합니다.
 *
 * 헤더가 첫 페인트부터 올바른 역할로 그려지도록 초기값(initialUser)을 제공하는 용도입니다.
 * 실패하거나 비로그인 상태면 null을 반환해, 기존 클라이언트 조회(useCurrentUser) 흐름으로
 * 자연스럽게 폴백합니다. (액세스 토큰 만료 시 refresh는 클라이언트 쪽에서 처리)
 *
 * React `cache()`로 감싸, 같은 서버 렌더 요청 안에서는 한 번만 조회합니다.
 * (레이아웃과 페이지가 각각 호출해도 `/auth/me` 왕복은 요청당 1회로 dedupe)
 */
export const getServerCurrentUser = cache(
  async (): Promise<CurrentUserResponse | null> => {
    try {
      // 원본 Cookie 헤더를 그대로 전달합니다. (toString() 재직렬화 시 값이 변형될 수 있음)
      const cookieHeader = (await headers()).get("cookie");
      if (!cookieHeader) return null;

      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
      if (!res.ok) return null;

      const body = (await res.json()) as ApiSuccessBody<CurrentUserResponse>;
      return body.data ?? null;
    } catch {
      return null;
    }
  },
);
