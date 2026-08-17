import { headers } from "next/headers";

import type {
  GradeCriteriaResponse,
  MyGradeResponse,
} from "@/features/freelancer/mypage/types/grade";
import type { FreelancerMyPageResponse } from "@/features/freelancer/mypage/types/profile";

// 백엔드 성공 응답 형식 (lib/api의 ApiSuccessBody와 동일 구조)
interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const cookieHeader = (await headers()).get("cookie");
    if (!cookieHeader) return null;

    const res = await fetch(`${API_BASE}${path}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const body = (await res.json()) as ApiSuccessBody<T>;
    return body.data ?? null;
  } catch {
    return null;
  }
}

/**
 * 서버 렌더 시점에 인증 쿠키로 프리랜서 기본 정보·등급을 조회합니다(`getServerCurrentUser`와 동일 패턴).
 *
 * 클라이언트에서만 조회하던 것을 서버에서 먼저 가져와, 첫 페인트부터 "불러오는 중" 상태 없이
 * 값이 보이도록 초기값을 제공하는 용도입니다. 실패하거나 쿠키가 없으면 null을 반환해,
 * 기존 클라이언트 조회 흐름으로 자연스럽게 폴백합니다.
 */
export const getServerFreelancerProfile = () =>
  serverGet<FreelancerMyPageResponse>("/api/v1/freelancers/me");

export const getServerMyGrade = () =>
  serverGet<MyGradeResponse>("/api/v1/grades/me");

export const getServerFreelancerGradeCriteria = () =>
  serverGet<GradeCriteriaResponse[]>("/api/v1/grades?role=FREELANCER");
