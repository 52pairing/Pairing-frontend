import { apiCall } from "@/lib/api";
import type { FindPasswordRequest } from "@/features/auth/types";

// 비밀번호 찾기(인증 링크 발송) 요청
// 입력한 email/name/phone이 실제로 일치하는지와 무관하게 항상 200이 옵니다.
// (가입 여부 노출 방지 목적 - 문서 7-2절) 그래서 응답만으로 성공 여부를 판단할 수 없습니다.
export const requestPasswordReset = (payload: FindPasswordRequest) =>
  apiCall<null>("/api/v1/auth/password/reset-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
