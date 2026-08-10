"use client";

import { useEffect, useId, useState } from "react";

import { ConfirmModal, Modal } from "@/features/common/components/Modal";
import { PaymentMethodCard } from "@/features/payment/components/PaymentMethodCard";
import { MOCK_PAYMENT_METHODS } from "@/features/payment/constants/mockPaymentMethods";
import {
  getMyPaymentMethods,
  getSettlement,
  paySettlement,
} from "@/features/payment/services/settlementPayment";
import type {
  AccountPaymentMethod,
  PaymentSummary,
  SettlementResponse,
} from "@/features/payment/types/payment";

interface PaymentMethodModalProps {
  open: boolean;
  payment: PaymentSummary;
  onClose: () => void;
  onPay: (settlement?: SettlementResponse) => void | Promise<void>;
}

const PHASE_LABEL = {
  DEPOSIT: "착수금 수수료",
  SUCCESS_FEE: "성공보수 수수료",
} as const;

export function PaymentMethodModal({
  open,
  payment,
  onClose,
  onPay,
}: PaymentMethodModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const isApiPayment = payment.settlementId != null;
  const [selectedMethodId, setSelectedMethodId] = useState(
    MOCK_PAYMENT_METHODS[0]?.id ?? "",
  );
  const [settlement, setSettlement] = useState<SettlementResponse | null>(null);
  const [card, setCard] = useState<AccountPaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(isApiPayment);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || payment.settlementId == null) return;

    let cancelled = false;
    const settlementId = payment.settlementId;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      setErrorMessage("");
      setSettlement(null);
      setCard(null);
    });

    Promise.all([getSettlement(settlementId), getMyPaymentMethods()])
      .then(([settlementResponse, methods]) => {
        if (cancelled) return;
        setSettlement(settlementResponse);
        setCard(methods.find((method) => method.methodType === "CARD") ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "결제 정보를 불러오지 못했습니다.",
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, payment.settlementId]);

  const closePaymentModal = () => {
    if (isPaying) return;
    setIsConfirmOpen(false);
    onClose();
  };

  const confirmPayment = async () => {
    if (!isApiPayment) {
      setIsConfirmOpen(false);
      void onPay();
      return;
    }

    if (!settlement || !card || !settlement.payable || isPaying) return;

    setIsPaying(true);
    setErrorMessage("");

    try {
      const response = await paySettlement(
        settlement.settlementId,
        card.paymentMethodId,
      );
      setSettlement(response);

      if (response.status !== "PAID") {
        setErrorMessage(response.failReason || "결제에 실패했습니다.");
        setIsConfirmOpen(false);
        setIsPaying(false);
        return;
      }

      setIsConfirmOpen(false);
      void onPay(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "결제에 실패했습니다.",
      );
      setIsConfirmOpen(false);
      setIsPaying(false);
    }
  };

  const amount = settlement?.feeAmount ?? payment.amount;
  const canPay = isApiPayment
    ? Boolean(settlement?.payable && card && !isLoading && !isPaying)
    : Boolean(selectedMethodId);

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
          <button type="button" onClick={closePaymentModal} aria-label="결제 모달 닫기" className="text-[22px] leading-none text-[#98a2b3] hover:text-[#475467]">×</button>
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-[#667085]">결제 정보를 불러오고 있습니다.</div>
        ) : (
          <>
            <div id={descriptionId} className="mt-4 rounded-[12px] bg-[#f7f8fa] px-5 py-4">
              <p className="text-[11px] font-semibold text-[#98a2b3]">
                {settlement?.projectTitle ?? payment.description} · {settlement ? PHASE_LABEL[settlement.phase] : payment.title}
              </p>
              <p className="mt-1 text-[24px] font-extrabold text-[#17365d]">
                {amount.toLocaleString("ko-KR")}<span className="ml-0.5 text-[12px]">원</span>
              </p>
            </div>

            <p className="mt-6 border-b border-[#e5e9ef] pb-3 text-[12px] font-bold text-[#667085]">신용·체크카드</p>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium text-[#98a2b3]">등록된 카드</p>
              {isApiPayment ? (
                card ? (
                  <div className="rounded-[11px] border border-[#17365d] bg-[#eef3f8] px-4 py-4">
                    <p className="text-[13px] font-bold text-[#111827]">{card.displayName}</p>
                  </div>
                ) : (
                  <p className="rounded-[11px] border border-[#fda29b] bg-[#fff5f4] px-4 py-4 text-[12px] font-semibold text-[#b42318]">등록된 카드가 없습니다.</p>
                )
              ) : (
                <div className="space-y-2">
                  {MOCK_PAYMENT_METHODS.map((method) => (
                    <PaymentMethodCard key={method.id} method={method} selected={selectedMethodId === method.id} onSelect={() => setSelectedMethodId(method.id)} />
                  ))}
                </div>
              )}
            </div>

            {errorMessage ? <p role="alert" className="mt-4 text-[11px] font-semibold text-[#b42318]">{errorMessage}</p> : null}
            {settlement && !settlement.payable && !errorMessage ? <p className="mt-4 text-[11px] font-semibold text-[#b42318]">현재 결제할 수 없는 정산 건입니다.</p> : null}

            <div className="mt-5 flex gap-2 border-t border-[#e5e9ef] pt-4">
              <button type="button" onClick={closePaymentModal} disabled={isPaying} className="h-[48px] flex-1 rounded-[10px] border border-[#dce2e8] bg-white text-[13px] font-semibold text-[#667085] disabled:cursor-wait">취소</button>
              <button type="button" onClick={() => setIsConfirmOpen(true)} disabled={!canPay} className="h-[48px] flex-[2] rounded-[10px] bg-[#17365d] text-[13px] font-bold text-white hover:bg-[#102a49] disabled:cursor-not-allowed disabled:bg-[#a7b0bf]">
                {isPaying ? "결제 중..." : `${amount.toLocaleString("ko-KR")}원 결제하기`}
              </button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmModal
        open={isConfirmOpen}
        title="결제하시겠습니까?"
        description={`${amount.toLocaleString("ko-KR")}원이 등록된 카드로 결제됩니다.`}
        confirmText={isPaying ? "결제 중..." : "결제"}
        cancelText="취소"
        onClose={() => !isPaying && setIsConfirmOpen(false)}
        onConfirm={() => void confirmPayment()}
        closeOnOverlayClick={!isPaying}
      />
    </>
  );
}
