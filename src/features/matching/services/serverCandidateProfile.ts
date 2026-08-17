import { headers } from "next/headers";

import type { CandidateProfileResponse } from "@/features/matching/types/matching";

// 백엔드 성공 응답 형식 (lib/api의 ApiSuccessBody와 동일 구조)
interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * 서버 렌더 시점에 인증 쿠키로 추천 후보 프로필을 조회합니다(`getServerCurrentUser`와 동일한 패턴).
 *
 * 클라이언트에서만 조회하던 것을 서버에서 먼저 가져와, 첫 페인트부터 로딩 스피너 없이
 * 프로필이 보이도록 초기값(initialProfile)을 제공하는 용도입니다.
 * 실패하거나 쿠키가 없으면 null을 반환해, 기존 클라이언트 조회(getCandidateProfile) 흐름으로
 * 자연스럽게 폴백합니다.
 */
export async function getServerCandidateProfile(
  candidateId: number,
): Promise<CandidateProfileResponse | null> {
  try {
    const cookieHeader = (await headers()).get("cookie");
    if (!cookieHeader) return null;

    const res = await fetch(
      `${API_BASE}/api/v1/matchings/candidates/${candidateId}/profile`,
      {
        headers: { cookie: cookieHeader },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;

    const body = (await res.json()) as ApiSuccessBody<CandidateProfileResponse>;
    return body.data ?? null;
  } catch {
    return null;
  }
}
