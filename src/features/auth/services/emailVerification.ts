import { apiCall } from "@/lib/api";
import type {
  SendVerificationCodeRequest,
  SendVerificationCodeResponseData,
} from "@/features/auth/types";

// 이메일 인증코드 발송 (가입/잠금해제/비밀번호변경 등 공통 엔드포인트)
export const sendVerificationCode = (payload: SendVerificationCodeRequest) =>
  apiCall<SendVerificationCodeResponseData>(
    "/api/v1/auth/email-verifications",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
