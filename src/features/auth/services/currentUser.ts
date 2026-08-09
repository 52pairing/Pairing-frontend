import type { CurrentUserResponse } from "@/features/auth/types";
import { apiCall } from "@/lib/api";

// 인증 쿠키를 기준으로 현재 로그인한 사용자 정보를 가져옵니다.
export const getCurrentUser = () =>
  apiCall<CurrentUserResponse>("/api/v1/auth/me");
