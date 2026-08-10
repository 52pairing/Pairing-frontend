import { apiCall } from "@/lib/api";
import type {
  AccountPaymentMethod,
  SettlementResponse,
} from "@/features/payment/types/payment";

export const getSettlement = (settlementId: number) =>
  apiCall<SettlementResponse>(`/api/v1/settlements/${settlementId}`);

export const getMyPaymentMethods = () =>
  apiCall<AccountPaymentMethod[]>("/api/v1/accounts/me/payment-methods");

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
