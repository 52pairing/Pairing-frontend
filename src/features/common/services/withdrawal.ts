import { apiCall } from "@/lib/api";
import type {
  WithdrawalEligibility,
  WithdrawalRequest,
} from "@/features/common/types/withdrawal";

export const getWithdrawalEligibility = () =>
  apiCall<WithdrawalEligibility>("/api/v1/accounts/me/withdrawal-eligibility");

export const withdrawAccount = (payload: WithdrawalRequest) =>
  apiCall<null>("/api/v1/accounts/me", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
