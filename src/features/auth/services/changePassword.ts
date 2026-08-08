import { apiCall } from "@/lib/api";
import type { ChangePasswordRequest } from "@/features/auth/types";

// 새 비밀번호 등록/변경 - 임시 비밀번호 로그인 직후와 마이페이지 변경이 같은 엔드포인트를 씀
// (인증코드 필요 여부는 서버가 계정의 tempPassword 상태로 판단)
export const changePassword = (payload: ChangePasswordRequest) =>
  apiCall<null>("/api/v1/auth/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
