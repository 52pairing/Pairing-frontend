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
