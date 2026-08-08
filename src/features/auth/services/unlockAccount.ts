import { apiCall } from "@/lib/api";
import type { UnlockAccountRequest } from "@/features/auth/types";

// 계정 잠금 해제 - 인증코드를 여기 바로 넣음 (email-verifications/confirm 거치지 않음)
export const unlockAccount = (payload: UnlockAccountRequest) =>
  apiCall<null>("/api/v1/auth/unlock", {
    method: "POST",
    body: JSON.stringify(payload),
  });
