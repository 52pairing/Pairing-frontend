"use client";

import { useCallback, useEffect, useState } from "react";

import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";
import type { PaymentFilter } from "@/features/client/mypage/types/components";
import { useToast } from "@/features/common/hooks/useToast";
import {
  getMySettlementSummary,
  getMySettlements,
} from "@/features/payment/services/settlementPayment";
import type {
  SettlementPageResponse,
  SettlementPhase,
  SettlementResponse,
  SettlementSummaryResponse,
} from "@/features/payment/types/payment";

const PAYMENT_FILTERS = ["전체", "착수금 수수료", "성공보수 수수료"] as const;
const FILTER_PHASE: Record<PaymentFilter, SettlementPhase | undefined> = {
  전체: undefined,
  "착수금 수수료": "DEPOSIT",
  "성공보수 수수료": "SUCCESS_FEE",
};
const PHASE_LABEL: Record<SettlementPhase, Exclude<PaymentFilter, "전체">> = {
  DEPOSIT: "착수금 수수료",
  SUCCESS_FEE: "성공보수 수수료",
};
const EMPTY_PAGE: SettlementPageResponse = {
  content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true,
};

export function ClientPaymentHistory() {
  const { error: showErrorToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("전체");
  const [summary, setSummary] = useState<SettlementSummaryResponse | null>(null);
  const [settlements, setSettlements] = useState<SettlementPageResponse>(EMPTY_PAGE);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(false);
  const [listError, setListError] = useState(false);

  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    setSummaryError(false);
    try {
      setSummary(await getMySettlementSummary());
    } catch (error) {
      setSummaryError(true);
      showErrorToast(getErrorMessage(error, "결제 요약을 불러오지 못했습니다."));
    } finally {
      setIsSummaryLoading(false);
    }
  }, [showErrorToast]);

  const loadSettlements = useCallback(async (filter: PaymentFilter, page: number) => {
    setIsListLoading(true);
    setListError(false);
    try {
      setSettlements(await getMySettlements({
        phase: FILTER_PHASE[filter],
        status: "PAID",
        page,
        size: 10,
      }));
    } catch (error) {
      setListError(true);
      showErrorToast(getErrorMessage(error, "결제 내역을 불러오지 못했습니다."));
    } finally {
      setIsListLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadSummary();
    });
    return () => { cancelled = true; };
  }, [loadSummary]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadSettlements(activeFilter, 0);
    });
    return () => { cancelled = true; };
  }, [activeFilter, loadSettlements]);

  const summaryTotal = activeFilter === "전체"
    ? summary?.totalAmount
    : activeFilter === "착수금 수수료"
      ? summary?.depositAmount
      : summary?.successFeeAmount;

  return (
    <ClientMyPageLayout activeMenu="payments">
      <div className="min-w-0">
        <section className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="총 납부 수수료" value={summary?.totalAmount} tone="navy" isLoading={isSummaryLoading} />
          <SummaryCard label="착수금 수수료" value={summary?.depositAmount} tone="blue" isLoading={isSummaryLoading} />
          <SummaryCard label="성공보수 수수료" value={summary?.successFeeAmount} tone="purple" isLoading={isSummaryLoading} />
        </section>
        {summaryError ? <ErrorMessage message="결제 요약을 불러오지 못했습니다." onRetry={loadSummary} /> : null}

        <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-5 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[16px] font-bold">결제 내역</h2>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_FILTERS.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <button key={filter} type="button" aria-pressed={isActive} onClick={() => setActiveFilter(filter)} className={`h-8 rounded-full border px-4 text-[11px] font-semibold transition ${isActive ? "border-brand bg-brand text-white" : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"}`}>
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {listError ? (
            <ErrorMessage message="결제 내역을 불러오지 못했습니다." onRetry={() => loadSettlements(activeFilter, settlements.page)} />
          ) : isListLoading ? (
            <div className="mt-5 flex h-28 items-center justify-center rounded-lg border border-theme text-[11px] font-semibold text-theme-muted">결제 내역을 불러오는 중입니다.</div>
          ) : settlements.content.length === 0 ? (
            <div className="mt-5 flex h-28 items-center justify-center rounded-lg border border-theme text-[11px] font-semibold text-theme-muted">결제 완료 내역이 없습니다.</div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-lg border border-theme">
              <table className="w-full min-w-[760px] border-collapse text-left text-[11px]">
                <thead className="bg-surface-subtle text-theme-muted"><tr><TableHeader>결제일</TableHeader><TableHeader>프로젝트</TableHeader><TableHeader>구분</TableHeader><TableHeader>금액</TableHeader><TableHeader>결제수단</TableHeader></tr></thead>
                <tbody>{settlements.content.map((settlement) => <PaymentRow key={settlement.settlementId} settlement={settlement} />)}</tbody>
              </table>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-theme pt-5 text-[11px]">
            <div>{settlements.totalPages > 1 ? <Pagination page={settlements.page} totalPages={settlements.totalPages} disabled={isListLoading} onChange={(page) => loadSettlements(activeFilter, page)} /> : null}</div>
            <div><span className="font-semibold text-theme-muted">조회 기간 합계</span><strong className="ml-3 text-[14px] text-brand">{summaryTotal == null ? "-" : formatWon(summaryTotal)}</strong></div>
          </div>
        </section>
      </div>
    </ClientMyPageLayout>
  );
}

function PaymentRow({ settlement }: { settlement: SettlementResponse }) {
  return <tr className="border-t border-theme"><td className="px-5 py-4 font-semibold text-theme-muted">{formatPaidAt(settlement.paidAt)}</td><td className="px-5 py-4"><p className="font-bold text-theme-primary">{settlement.projectTitle ?? "-"}</p><p className="mt-1 text-[10px] font-semibold text-theme-muted">{settlement.settlementNo ?? "-"}</p></td><td className="px-5 py-4"><PaymentTypeBadge phase={settlement.phase} /></td><td className="px-5 py-4 text-[13px] font-extrabold text-theme-primary">{formatWon(settlement.feeAmount)}</td><td className="px-5 py-4 font-semibold text-theme-secondary">{settlement.paymentMethodLabel ?? ""}</td></tr>;
}

function SummaryCard({ label, value, tone, isLoading }: { label: string; value?: number; tone: "navy" | "blue" | "purple"; isLoading: boolean }) {
  const colors = { navy: "text-brand", blue: "text-[#3478f6]", purple: "text-[#7c3aed]" };
  return <article className="flex min-h-[108px] flex-col items-center justify-center rounded-xl border border-theme bg-surface px-4 text-center"><p className="text-[11px] font-semibold text-theme-muted">{label}</p><strong className={`mt-3 text-[19px] font-extrabold ${colors[tone]}`}>{isLoading ? "불러오는 중" : value == null ? "-" : formatWon(value)}</strong></article>;
}

function PaymentTypeBadge({ phase }: { phase: SettlementPhase }) {
  const isSuccessFee = phase === "SUCCESS_FEE";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${isSuccessFee ? "bg-[#f3ecff] text-[#7c3aed]" : "bg-[#e6f6ff] text-[#1687bd]"}`}>{PHASE_LABEL[phase]}</span>;
}

function Pagination({ page, totalPages, disabled, onChange }: { page: number; totalPages: number; disabled: boolean; onChange: (page: number) => void }) {
  return <nav aria-label="결제 내역 페이지" className="flex items-center gap-2"><button type="button" disabled={disabled || page === 0} onClick={() => onChange(page - 1)} className="rounded border border-theme px-3 py-1.5 font-semibold disabled:opacity-40">이전</button><span className="font-semibold text-theme-muted">{page + 1} / {totalPages}</span><button type="button" disabled={disabled || page + 1 >= totalPages} onClick={() => onChange(page + 1)} className="rounded border border-theme px-3 py-1.5 font-semibold disabled:opacity-40">다음</button></nav>;
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void | Promise<void> }) {
  return <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-theme px-4 py-3 text-[11px] font-semibold text-theme-danger"><span>{message}</span><button type="button" onClick={() => void onRetry()} className="underline">다시 시도</button></div>;
}

function TableHeader({ children }: { children: React.ReactNode }) { return <th className="px-5 py-3 font-semibold">{children}</th>; }
function formatWon(amount: number) { return `${amount.toLocaleString("ko-KR")}원`; }
function formatPaidAt(paidAt?: string | null) {
  if (!paidAt) return "-";
  return paidAt.slice(0, 10).replaceAll("-", ".");
}
function getErrorMessage(error: unknown, fallback: string) { return error instanceof Error && error.message ? error.message : fallback; }
