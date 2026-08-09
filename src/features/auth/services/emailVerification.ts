import { apiCall } from "@/lib/api";
import type {
  ConfirmVerificationCodeRequest,
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

// 회원가입과 비밀번호 변경은 발송한 코드를 이 API에서 확인합니다.
export const confirmVerificationCode = (
  payload: ConfirmVerificationCodeRequest,
) =>
  apiCall<null>("/api/v1/auth/email-verifications/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
