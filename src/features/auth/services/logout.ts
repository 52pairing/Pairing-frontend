import { apiCall } from "@/lib/api";

// 백엔드 세션을 삭제하고 인증 쿠키를 만료시킵니다.
export const logout = () =>
  apiCall<null>("/api/v1/auth/logout", {
    method: "POST",
  });
