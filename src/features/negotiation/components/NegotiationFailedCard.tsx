import { NegotiationResultCard } from "@/features/negotiation/components/NegotiationResultCard";

/** 협상 성공 결과 카드와 동일한 규격을 사용하는 실패 결과 카드입니다. */
export function NegotiationFailedCard() {
  return <NegotiationResultCard result="failed" />;
}
