export type PaymentType = "UPFRONT_FEE" | "SUCCESS_FEE" | "PAID_REMATCH";

export interface PaymentSummary {
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

export interface SuccessFeePaymentSummary {
  projectTitle: string;
  duration: string;
  contractAmount: number;
  baseRate: number;
  discountLabel?: string;
  discountRate?: number;
  paymentAmount: number;
}
