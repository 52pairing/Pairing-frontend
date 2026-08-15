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
import { ApiException } from "@/lib/api";

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
  const [cards, setCards] = useState<AccountPaymentMethod[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
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
      setCards([]);
      setSelectedCardId(null);
    });

    Promise.all([getSettlement(settlementId), getMyPaymentMethods()])
      .then(([settlementResponse, methods]) => {
        if (cancelled) return;
        const cards = methods.filter((method) => method.methodType === "CARD");
        setSettlement(settlementResponse);
        setCards(cards);
        setSelectedCardId((cards.find((method) => method.isDefault) ?? cards[0])?.paymentMethodId ?? null);
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

    if (!settlement || selectedCardId == null || !settlement.payable || isPaying) return;

    setIsPaying(true);
    setErrorMessage("");

    try {
      const response = await paySettlement(
        settlement.settlementId,
        selectedCardId,
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
      setErrorMessage(getPaymentErrorMessage(error));
      setIsConfirmOpen(false);
      setIsPaying(false);
    }
  };

  const amount = settlement?.feeAmount ?? payment.amount;
  const feeRate = Number(settlement?.feeRate ?? 0);
  const gradeDiscount = Number(settlement?.gradeDiscount ?? 0);
  const appliedRate = feeRate - gradeDiscount;
  const canPay = isApiPayment
    ? Boolean(settlement?.payable && selectedCardId != null && !isLoading && !isPaying)
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
          <h2 id={titleId} className="text-[18px] font-extrabold text-theme-primary">
            결제 수단 선택
          </h2>
          <button type="button" onClick={closePaymentModal} aria-label="결제 모달 닫기" className="text-[22px] leading-none text-theme-muted hover:text-theme-secondary">×</button>
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-theme-secondary">결제 정보를 불러오고 있습니다.</div>
        ) : (
          <>
            <div id={descriptionId} className="mt-4 rounded-[12px] bg-surface-subtle px-5 py-4">
              <p className="text-[11px] font-semibold text-theme-muted">
                {settlement?.projectTitle ?? payment.description} · {settlement ? PHASE_LABEL[settlement.phase] : payment.title}
              </p>
              <p className="mt-1 text-[24px] font-extrabold text-brand">
                {amount.toLocaleString("ko-KR")}<span className="ml-0.5 text-[12px]">원</span>
              </p>
              {settlement ? (
                <dl className="mt-4 space-y-2 border-t border-theme pt-3 text-[11px]">
                  <PaymentDetailRow label="계약 금액" value={`${settlement.baseAmount.toLocaleString("ko-KR")}원`} />
                  {payment.duration ? <PaymentDetailRow label="계약 기간" value={payment.duration} /> : null}
                  <PaymentDetailRow label={`${PHASE_LABEL[settlement.phase]}율`} value={gradeDiscount > 0 ? `${formatRate(feeRate)}% → 마스터 할인 ${formatRate(gradeDiscount)}% = ${formatRate(appliedRate)}%` : `${formatRate(feeRate)}%`} />
                  <PaymentDetailRow label="결제 금액" value={`${settlement.feeAmount.toLocaleString("ko-KR")}원`} />
                </dl>
              ) : null}
            </div>

            <p className="mt-6 border-b border-theme pb-3 text-[12px] font-bold text-theme-secondary">신용·체크카드</p>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium text-theme-muted">등록된 카드</p>
              {isApiPayment ? (
                cards.length ? (
                  <div className="space-y-2">
                    {cards.map((card) => (
                      <button key={card.paymentMethodId} type="button" aria-pressed={selectedCardId === card.paymentMethodId} onClick={() => setSelectedCardId(card.paymentMethodId)} className={`w-full rounded-[11px] border px-4 py-4 text-left transition ${selectedCardId === card.paymentMethodId ? "border-brand bg-[#eef3f8]" : "border-theme bg-surface hover:bg-surface-subtle"}`}>
                        <p className="text-[13px] font-bold text-theme-primary">{card.displayName}{card.isDefault ? " (기본)" : ""}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-[11px] border border-[#fda29b] bg-danger-surface px-4 py-4 text-[12px] font-semibold text-theme-danger">등록된 카드가 없습니다.</p>
                )
              ) : (
                <div className="space-y-2">
                  {MOCK_PAYMENT_METHODS.map((method) => (
                    <PaymentMethodCard key={method.id} method={method} selected={selectedMethodId === method.id} onSelect={() => setSelectedMethodId(method.id)} />
                  ))}
                </div>
              )}
            </div>

            {errorMessage ? <p role="alert" className="mt-4 text-[11px] font-semibold text-theme-danger">{errorMessage}</p> : null}
            {settlement && !settlement.payable && !errorMessage ? <p className="mt-4 text-[11px] font-semibold text-theme-danger">현재 결제할 수 없는 정산 건입니다.</p> : null}

            <div className="mt-5 flex gap-2 border-t border-theme pt-4">
              <button type="button" onClick={closePaymentModal} disabled={isPaying} className="h-[48px] flex-1 rounded-[10px] border border-theme bg-surface text-[13px] font-semibold text-theme-secondary disabled:cursor-wait">취소</button>
              <button type="button" onClick={() => setIsConfirmOpen(true)} disabled={!canPay} className="h-[48px] flex-[2] rounded-[10px] bg-brand text-[13px] font-bold text-white hover:bg-brand disabled:cursor-not-allowed disabled:bg-[#a7b0bf]">
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

function PaymentDetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="font-medium text-theme-muted">{label}</dt><dd className="text-right font-bold text-theme-primary">{value}</dd></div>;
}

const formatRate = (value: number) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

function getPaymentErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) return error instanceof Error ? error.message : "결제에 실패했습니다.";
  if (error.errorCode === "SETTLEMENT_NOT_FOUND") return "정산 정보를 찾을 수 없습니다.";
  if (error.errorCode === "NOT_PAYER") return "이 정산을 결제할 권한이 없습니다.";
  if (error.errorCode === "NOT_PAYABLE") return "이미 결제되었거나 취소된 정산입니다. 계약 목록을 새로고침해 주세요.";
  return error.message;
}
