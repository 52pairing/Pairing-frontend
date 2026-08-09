"use client";

import { useId, useState } from "react";

import { Modal } from "@/features/common/components/Modal";
import { ConfirmModal } from "@/features/common/components/Modal";
import { PaymentMethodCard } from "@/features/payment/components/PaymentMethodCard";
import { MOCK_PAYMENT_METHODS } from "@/features/payment/constants/mockPaymentMethods";
import type { PaymentSummary } from "@/features/payment/types/payment";

interface PaymentMethodModalProps {
  open: boolean;
  payment: PaymentSummary;
  onClose: () => void;
  onPay: () => void;
}

export function PaymentMethodModal({
  open,
  payment,
  onClose,
  onPay,
}: PaymentMethodModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [selectedMethodId, setSelectedMethodId] = useState(
    MOCK_PAYMENT_METHODS[0]?.id ?? "",
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closePaymentModal = () => {
    setIsConfirmOpen(false);
    onClose();
  };

  const confirmPayment = () => {
    setIsConfirmOpen(false);
    onPay();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={closePaymentModal}
        labelledBy={titleId}
        describedBy={descriptionId}
        size="lg"
      >
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="text-[18px] font-extrabold text-[#111827]">
          결제 수단 선택
        </h2>
        <button
          type="button"
          onClick={closePaymentModal}
          aria-label="결제 모달 닫기"
          className="cursor-pointer text-[22px] leading-none text-[#98a2b3] hover:text-[#475467]"
        >
          ×
        </button>
      </div>

      <div
        id={descriptionId}
        className="mt-4 rounded-[12px] bg-[#f7f8fa] px-5 py-4"
      >
        <p className="text-[11px] font-semibold text-[#98a2b3]">
          {payment.description} · {payment.title}
        </p>
        <p className="mt-1 text-[24px] font-extrabold text-[#17365d]">
          {payment.amount.toLocaleString("ko-KR")}
          <span className="ml-0.5 text-[12px]">원</span>
        </p>
      </div>

      <p className="mt-6 border-b border-[#e5e9ef] pb-3 text-[12px] font-bold text-[#667085]">
        신용·체크카드
      </p>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium text-[#98a2b3]">등록된 카드</p>
        <div className="space-y-2">
          {MOCK_PAYMENT_METHODS.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              selected={selectedMethodId === method.id}
              onSelect={() => setSelectedMethodId(method.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-[#e5e9ef] pt-4">
        <button
          type="button"
          onClick={closePaymentModal}
          className="h-[48px] flex-1 cursor-pointer rounded-[10px] border border-[#dce2e8] bg-white text-[13px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!selectedMethodId}
          className="h-[48px] flex-[2] cursor-pointer rounded-[10px] bg-[#17365d] text-[13px] font-bold text-white transition hover:bg-[#102a49] disabled:cursor-not-allowed disabled:bg-[#a7b0bf]"
        >
          {payment.amount.toLocaleString("ko-KR")}원 결제하기
        </button>
      </div>
      </Modal>
      <ConfirmModal
        open={isConfirmOpen}
        title="결제하시겠습니까?"
        description={`${payment.amount.toLocaleString("ko-KR")}원이 선택한 결제 수단으로 결제됩니다.`}
        confirmText="결제"
        cancelText="취소"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmPayment}
      />
    </>
  );
}
