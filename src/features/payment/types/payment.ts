export type PaymentType = "UPFRONT_FEE" | "SUCCESS_FEE" | "PAID_REMATCH";

export interface PaymentSummary {
  settlementId?: number;
  type: PaymentType;
  title: string;
  description: string;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  issuer: string;
  maskedNumber: string;
}

export type SettlementPhase = "DEPOSIT" | "SUCCESS_FEE";
export type SettlementStatus = "PENDING" | "PAID" | "FAILED" | "OVERDUE";

export interface SettlementResponse {
  settlementId: number;
  projectId: number;
  projectTitle: string;
  phase: SettlementPhase;
  feeAmount: number;
  payable: boolean;
  status: SettlementStatus;
  approvalNo?: string | null;
  paidAt?: string | null;
  failReason?: string | null;
}

export interface AccountPaymentMethod {
  paymentMethodId: number;
  methodType: "CARD" | "BANK_ACCOUNT";
  displayName: string;
  cardBrand: string | null;
  cardLast4: string | null;
  cardHolder: string | null;
}

export interface SuccessFeePaymentSummary {
  projectTitle: string;
  duration: string;
  contractAmount: number;
  baseRate: number;
  discountLabel?: string;
  discountRate?: number;
  paymentAmount: number;
}
