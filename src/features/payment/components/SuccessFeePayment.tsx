"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";

const CONTRACT_AMOUNT = 60_000_000;
const SUCCESS_FEE = 1_800_000;

export function SuccessFeePayment() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const completePayment = () => {
    setIsPaymentModalOpen(false);
    router.push(`/client/projects/${params.projectId}/success-fee/complete`);
  };

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-[#f7f8fa] px-5 py-8 text-[#172033]">
      <div className="mx-auto w-full max-w-[520px]">
        <h1 className="text-[25px] font-extrabold tracking-[-0.04em]">성공보수 결제</h1>

        <section className="mt-7 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
          <h2 className="text-[14px] font-bold">프로젝트 정보</h2>
          <dl className="mt-5 space-y-4 text-[12px]">
            <PaymentRow label="프로젝트명" value="B2B 주문 관리 서비스 리뉴얼" />
            <PaymentRow label="계약 금액" value={`${CONTRACT_AMOUNT.toLocaleString("ko-KR")}원`} />
            <PaymentRow label="프리랜서" value="김개발 외 2명" />
          </dl>
        </section>

        <section className="mt-4 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
          <h2 className="text-[14px] font-bold">결제 항목</h2>
          <dl className="mt-5 space-y-4 text-[12px]">
            <PaymentRow label="성공보수 수수료" value={`${SUCCESS_FEE.toLocaleString("ko-KR")}원`} />
            <PaymentRow label="계산 기준: 계약 금액의 3%" value={`${CONTRACT_AMOUNT.toLocaleString("ko-KR")}원`} muted />
          </dl>
          <div className="mt-5 flex items-center justify-between border-t border-[#e5e9ef] pt-5">
            <span className="text-[14px] font-bold">최종 결제 금액</span>
            <strong className="text-[20px] font-extrabold text-[#17365d]">{SUCCESS_FEE.toLocaleString("ko-KR")}원</strong>
          </div>
        </section>

        <label className="mt-5 flex cursor-pointer items-center gap-3 text-[12px] font-semibold text-[#667085]">
          <input type="checkbox" checked={isAgreed} onChange={(event) => setIsAgreed(event.target.checked)} className="h-4 w-4 cursor-pointer rounded border-[#dce2e8] accent-[#17365d]" />
          결제 약관에 동의합니다.
        </label>

        <button type="button" disabled={!isAgreed} onClick={() => setIsPaymentModalOpen(true)} className="mt-5 h-[48px] w-full cursor-pointer rounded-[9px] bg-[#17365d] text-[14px] font-bold text-white transition hover:bg-[#102a49] disabled:cursor-not-allowed disabled:bg-[#a7b0bf]">
          {SUCCESS_FEE.toLocaleString("ko-KR")}원 결제하기
        </button>
      </div>

      <PaymentMethodModal
        open={isPaymentModalOpen}
        payment={{ type: "SUCCESS_FEE", title: "성공보수 수수료", description: "B2B 주문 관리 서비스 리뉴얼", amount: SUCCESS_FEE }}
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={completePayment}
      />
    </main>
  );
}

function PaymentRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return <div className={`flex items-center justify-between gap-5 ${muted ? "text-[#98a2b3]" : ""}`}><dt className="font-semibold">{label}</dt><dd className="text-right font-bold">{value}</dd></div>;
}
