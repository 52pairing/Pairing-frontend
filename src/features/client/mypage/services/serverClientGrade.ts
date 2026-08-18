import { headers } from "next/headers";

import type { ClientMyGradeResponse } from "@/features/client/mypage/types/grade";

interface ApiSuccessBody<T> {
  code: string;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** 클라이언트 메인 첫 렌더에서 등급 배지를 바로 표시하기 위한 서버 조회입니다. */
export async function getServerClientMyGrade(): Promise<ClientMyGradeResponse | null> {
  try {
    const cookieHeader = (await headers()).get("cookie");
    if (!cookieHeader) return null;

    const response = await fetch(`${API_BASE}/api/v1/grades/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const body = (await response.json()) as ApiSuccessBody<ClientMyGradeResponse>;
    return body.data ?? null;
  } catch {
    return null;
  }
}
