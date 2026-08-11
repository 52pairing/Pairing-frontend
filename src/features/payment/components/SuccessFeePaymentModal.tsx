"use client";

import { useId, useState } from "react";

import { Modal } from "@/features/common/components/Modal";
import { ConfirmModal } from "@/features/common/components/Modal";
import { PaymentMethodCard } from "@/features/payment/components/PaymentMethodCard";
import { MOCK_PAYMENT_METHODS } from "@/features/payment/constants/mockPaymentMethods";
import type { SuccessFeePaymentSummary } from "@/features/payment/types/payment";

interface SuccessFeePaymentModalProps {
  open: boolean;
  summary: SuccessFeePaymentSummary;
  onClose: () => void;
  onPay: () => void;
}

export function SuccessFeePaymentModal({
  open,
  summary,
  onClose,
  onPay,
}: SuccessFeePaymentModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [selectedMethodId, setSelectedMethodId] = useState(MOCK_PAYMENT_METHODS[0]?.id ?? "");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const appliedRate = summary.discountRate ?? summary.baseRate;

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
      <Modal open={open} onClose={closePaymentModal} labelledBy={titleId} describedBy={descriptionId} size="lg">
      <h2 id={titleId} className="text-[20px] font-extrabold text-theme-primary">성공보수 수수료 결제</h2>
      <p id={descriptionId} className="mt-2 text-[12px] font-semibold text-theme-secondary">
        프로젝트가 완료되었습니다. 성공보수 수수료를 결제하면 계약이 종료됩니다.
      </p>

      <dl className="mt-5 space-y-3 rounded-xl bg-[#f5f2ff] px-5 py-5 text-[12px]">
        <PaymentRow label="프로젝트" value={summary.projectTitle} accent />
        <PaymentRow label="계약 기간" value={summary.duration} />
        <PaymentRow label="총 계약 금액" value={`${summary.contractAmount.toLocaleString("ko-KR")}원`} />
        <PaymentRow
          label="성공보수 수수료율"
          value={summary.discountLabel ? `${summary.baseRate}% → ${summary.discountLabel} = ${appliedRate}%` : `${appliedRate}%`}
        />
        <PaymentRow label="결제 금액" value={`${summary.paymentAmount.toLocaleString("ko-KR")}원`} emphasis />
      </dl>

      <div className="mt-5 space-y-2">
        {MOCK_PAYMENT_METHODS.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={selectedMethodId === method.id}
            onSelect={() => setSelectedMethodId(method.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={closePaymentModal} className="h-11 rounded-lg border border-theme bg-surface px-5 text-[12px] font-semibold text-theme-secondary hover:bg-surface-subtle">취소</button>
        <button type="button" onClick={() => setIsConfirmOpen(true)} disabled={!selectedMethodId} className="h-11 rounded-lg bg-brand px-6 text-[12px] font-bold text-white hover:bg-brand disabled:bg-[#a7b0bf]">결제하기</button>
      </div>
      </Modal>
      <ConfirmModal
        open={isConfirmOpen}
        title="결제하시겠습니까?"
        description={`${summary.paymentAmount.toLocaleString("ko-KR")}원이 선택한 결제 수단으로 결제됩니다.`}
        confirmText="결제"
        cancelText="취소"
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmPayment}
      />
    </>
  );
}

function PaymentRow({ label, value, accent = false, emphasis = false }: { label: string; value: string; accent?: boolean; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={accent ? "font-bold text-[#7c3aed]" : "font-semibold text-theme-secondary"}>{label}</dt>
      <dd className={`text-right font-bold ${emphasis ? "text-[16px] text-[#7c3aed]" : "text-theme-primary"}`}>{value}</dd>
    </div>
  );
}
