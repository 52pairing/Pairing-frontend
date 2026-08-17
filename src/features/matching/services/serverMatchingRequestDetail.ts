import { headers } from "next/headers";

import type { MatchingRequestResponse } from "@/features/matching/types/matching";

// 백엔드 성공 응답 형식 (lib/api의 ApiSuccessBody와 동일 구조)
interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * 서버 렌더 시점에 인증 쿠키로 매칭 요청(제안) 상세를 조회합니다(`getServerCurrentUser`와 동일 패턴).
 *
 * 클라이언트에서만 조회하던 것을 서버에서 먼저 가져와, 첫 페인트부터 "불러오고 있습니다" 상태
 * 없이 상세가 보이도록 초기값을 제공하는 용도입니다. 실패하거나 쿠키가 없으면 null을 반환해,
 * 기존 클라이언트 조회(getMatchingRequestDetail) 흐름으로 자연스럽게 폴백합니다.
 */
export async function getServerMatchingRequestDetail(
  requestId: number,
): Promise<MatchingRequestResponse | null> {
  try {
    const cookieHeader = (await headers()).get("cookie");
    if (!cookieHeader) return null;

    const res = await fetch(
      `${API_BASE}/api/v1/matchings/requests/${requestId}`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;

    const body = (await res.json()) as ApiSuccessBody<MatchingRequestResponse>;
    return body.data ?? null;
  } catch {
    return null;
  }
}
