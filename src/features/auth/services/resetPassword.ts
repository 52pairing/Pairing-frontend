import { apiCall } from "@/lib/api";

// 비밀번호 재설정 링크의 토큰을 확인. 성공하면 임시 비밀번호가 메일로만 발송되고,
// 화면에는 절대 내려오지 않음 (문서 7-4절)
export const confirmPasswordReset = (token: string) =>
  apiCall<null>("/api/v1/auth/password/reset-confirm", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
