export type PaymentType = "UPFRONT_FEE" | "SUCCESS_FEE" | "PAID_REMATCH";

export interface PaymentSummary {
  settlementId?: number;
  type: PaymentType;
  title: string;
  description: string;
  amount: number;
  duration?: string;
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
  baseAmount: number;
  feeRate: number | string;
  gradeDiscount: number | string;
  feeAmount: number;
  dueDate: string | null;
  payable: boolean;
  status: SettlementStatus;
  approvalNo?: string | null;
  paidAt?: string | null;
  paymentMethodLabel?: string | null;
  failReason?: string | null;
}

export interface AccountPaymentMethod {
  paymentMethodId: number;
  methodType: "CARD" | "BANK_ACCOUNT";
  displayName: string;
  cardBrand: string | null;
  cardLast4: string | null;
  cardHolder: string | null;
  bankName: string | null;
  accountLast4: string | null;
  accountHolder: string | null;
  isDefault: boolean;
}

export interface SettlementPageResponse {
  content: SettlementResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
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
