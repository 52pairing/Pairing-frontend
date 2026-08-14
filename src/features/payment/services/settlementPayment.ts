import { apiCall } from "@/lib/api";
import type {
  AccountPaymentMethod,
  SettlementPhase,
  SettlementPageResponse,
  SettlementResponse,
  SettlementSummaryResponse,
} from "@/features/payment/types/payment";

export const getSettlement = (settlementId: number) =>
  apiCall<SettlementResponse>(`/api/v1/settlements/${settlementId}`);

export const getMyPaymentMethods = () =>
  apiCall<AccountPaymentMethod[]>("/api/v1/accounts/me/payment-methods");

export const updateMyCard = (request: { cardBrand: string; cardNumber: string; cardHolder: string }) =>
  apiCall<AccountPaymentMethod>("/api/v1/accounts/me/payment-methods/card", { method: "PUT", body: JSON.stringify(request) });

export const updateMyBankAccount = (request: { bankCode: string; accountNo: string; accountHolder: string }) =>
  apiCall<AccountPaymentMethod>("/api/v1/accounts/me/payment-methods/bank-account", { method: "PUT", body: JSON.stringify(request) });

export const getMySettlementSummary = () =>
  apiCall<SettlementSummaryResponse>("/api/v1/settlements/mine/summary");

interface GetMySettlementsOptions {
  projectId?: number;
  phase?: SettlementPhase;
  status?: SettlementResponse["status"];
  page?: number;
  size?: number;
}

export function getMySettlements(options?: GetMySettlementsOptions): Promise<SettlementPageResponse>;
export function getMySettlements(projectId?: number, page?: number, size?: number): Promise<SettlementPageResponse>;
export function getMySettlements(
  optionsOrProjectId?: GetMySettlementsOptions | number,
  legacyPage = 0,
  legacySize = 10,
) {
  const options = typeof optionsOrProjectId === "object"
    ? optionsOrProjectId
    : { projectId: optionsOrProjectId, page: legacyPage, size: legacySize };

  const query = new URLSearchParams({
    page: String(options.page ?? 0),
    size: String(options.size ?? 10),
  });

  if (options.projectId != null) query.set("projectId", String(options.projectId));
  if (options.phase) query.set("phase", options.phase);
  if (options.status) query.set("status", options.status);

  return apiCall<SettlementPageResponse>(`/api/v1/settlements/mine?${query}`);
}

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
