import type { PaymentMethod } from "@/features/payment/types/payment";

/** 실제 결제 연동 전 화면 확인용 목 데이터입니다. */
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "mock-card-1", issuer: "신한카드", maskedNumber: "1234-****-****-5678" },
];
