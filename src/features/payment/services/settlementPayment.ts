import { apiCall } from "@/lib/api";
import type {
  AccountPaymentMethod,
  SettlementPageResponse,
  SettlementResponse,
} from "@/features/payment/types/payment";

export const getSettlement = (settlementId: number) =>
  apiCall<SettlementResponse>(`/api/v1/settlements/${settlementId}`);

export const getMyPaymentMethods = () =>
  apiCall<AccountPaymentMethod[]>("/api/v1/accounts/me/payment-methods");

export const getMySettlements = (projectId?: number, page = 0, size = 10) => {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (projectId != null) query.set("projectId", String(projectId));

  return apiCall<SettlementPageResponse>(`/api/v1/settlements/mine?${query}`);
};

export const paySettlement = (
  settlementId: number,
  paymentMethodId: number,
) =>
  apiCall<SettlementResponse>(
    `/api/v1/settlements/${settlementId}/payment`,
    {
      method: "POST",
      body: JSON.stringify({ paymentMethodId }),
    },
  );
