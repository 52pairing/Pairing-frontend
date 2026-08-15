"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/features/common/hooks/useToast";
import { FreelancerMyPageLayout } from "@/features/freelancer/mypage/components/FreelancerMyPageLayout";
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
type PaymentFilter = (typeof PAYMENT_FILTERS)[number];

const FILTER_PHASE: Record<PaymentFilter, SettlementPhase | undefined> = {
  전체: undefined,
  "착수금 수수료": "DEPOSIT",
  "성공보수 수수료": "SUCCESS_FEE",
};

const STATUS_LABEL: Record<SettlementResponse["status"], string> = {
  PENDING: "결제 대기",
  PAID: "결제 완료",
  OVERDUE: "미납",
  FAILED: "결제 실패",
  CANCELED: "취소됨",
};

const EMPTY_PAGE: SettlementPageResponse = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export function FreelancerPaymentHistory() {
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

  return (
    <FreelancerMyPageLayout activeMenu="payments">
      <section className="min-w-0 overflow-hidden rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7">
        <h2 className="text-[16px] font-bold">수수료 결제 내역</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {PAYMENT_FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button key={filter} type="button" aria-pressed={isActive} onClick={() => setActiveFilter(filter)} className={`h-8 rounded-full border px-4 text-[11px] font-semibold transition ${isActive ? "border-brand bg-brand text-white" : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"}`}>
                {filter}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg bg-surface-subtle px-4 py-4 text-[11px]">
          <p><span className="font-semibold text-theme-muted">총 성공보수 납부</span> <strong className="ml-1 text-[14px]">{isSummaryLoading ? "불러오는 중" : summary ? formatWon(summary.successFeeAmount) : "-"}</strong></p>
          <p><span className="font-semibold text-theme-muted">완료 프로젝트 수</span> <strong className="ml-1 text-[14px]">{isSummaryLoading ? "불러오는 중" : summary ? `${summary.successFeeProjectCount}건` : "-"}</strong></p>
        </div>
        {summaryError ? <ErrorMessage message="결제 요약을 불러오지 못했습니다." onRetry={loadSummary} /> : null}

        {listError ? (
          <ErrorMessage message="결제 내역을 불러오지 못했습니다." onRetry={() => loadSettlements(activeFilter, settlements.page)} />
        ) : isListLoading ? (
          <EmptyState>결제 내역을 불러오는 중입니다.</EmptyState>
        ) : settlements.content.length === 0 ? (
          <EmptyState>결제 완료 내역이 없습니다.</EmptyState>
        ) : (
          <div className="mt-5 divide-y divide-[#e5e9ef] border-b border-theme">
            {settlements.content.map((settlement) => (
              <SettlementRow key={settlement.settlementId} settlement={settlement} />
            ))}
          </div>
        )}

        {settlements.totalPages > 1 ? (
          <Pagination page={settlements.page} totalPages={settlements.totalPages} disabled={isListLoading} onChange={(page) => loadSettlements(activeFilter, page)} />
        ) : null}
      </section>
    </FreelancerMyPageLayout>
  );
}

function SettlementRow({ settlement }: { settlement: SettlementResponse }) {
  const details = [
    settlement.clientName,
    settlement.paymentMethodLabel,
    formatPaidAt(settlement.paidAt),
  ].filter((value): value is string => Boolean(value));

  return (
    <article className="flex min-w-0 flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-[13px] font-bold">{settlement.projectTitle ?? "-"}</h3>
        {details.length > 0 ? <p className="mt-1.5 break-words text-[11px] font-semibold leading-5 text-theme-muted">{details.join(" · ")}</p> : null}
      </div>
      <div className="text-left sm:text-right">
        <strong className="text-[16px] font-extrabold">{formatWon(settlement.feeAmount)}</strong>
        <p className="mt-1.5"><span className="rounded-full border border-[#cbd8e6] bg-[#f4f7fa] px-2.5 py-1 text-[10px] font-semibold text-theme-secondary">{STATUS_LABEL[settlement.status]}</span></p>
      </div>
    </article>
  );
}

function Pagination({ page, totalPages, disabled, onChange }: { page: number; totalPages: number; disabled: boolean; onChange: (page: number) => void }) {
  return <nav aria-label="결제 내역 페이지" className="mt-5 flex items-center justify-center gap-2 text-[11px]"><button type="button" disabled={disabled || page === 0} onClick={() => onChange(page - 1)} className="rounded border border-theme px-3 py-1.5 font-semibold disabled:opacity-40">이전</button><span className="font-semibold text-theme-muted">{page + 1} / {totalPages}</span><button type="button" disabled={disabled || page + 1 >= totalPages} onClick={() => onChange(page + 1)} className="rounded border border-theme px-3 py-1.5 font-semibold disabled:opacity-40">다음</button></nav>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex h-28 items-center justify-center rounded-lg border border-theme text-[11px] font-semibold text-theme-muted">{children}</div>;
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void | Promise<void> }) {
  return <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-theme px-4 py-3 text-[11px] font-semibold text-theme-danger"><span>{message}</span><button type="button" onClick={() => void onRetry()} className="underline">다시 시도</button></div>;
}

function formatWon(amount: number) { return `${amount.toLocaleString("ko-KR")}원`; }
function formatPaidAt(paidAt?: string | null) { return paidAt ? paidAt.slice(0, 10).replaceAll("-", ".") : ""; }
function getErrorMessage(error: unknown, fallback: string) { return error instanceof Error && error.message ? error.message : fallback; }
