"use client";

import { useState } from "react";

import { ClientMyPageSidebar } from "@/features/client/components/ClientMyPageSidebar";
import type { PaymentFilter, PaymentHistoryItem } from "@/features/client/mypage/types/components";

const PAYMENT_FILTERS = ["전체", "착수금 수수료", "성공보수 수수료"] as const;

const PAYMENT_HISTORY: readonly PaymentHistoryItem[] = [
  { id: "PAY-2026-0042", paidAt: "2026.06.18", projectTitle: "B2B 주문 관리 서비스 리뉴얼", type: "성공보수 수수료", amount: 4200000, paymentMethod: "신한카드 1234" },
  { id: "PAY-2026-0031", paidAt: "2026.03.05", projectTitle: "B2B 주문 관리 서비스 리뉴얼", type: "착수금 수수료", amount: 1800000, paymentMethod: "신한카드 1234" },
  { id: "PAY-2026-0019", paidAt: "2026.01.10", projectTitle: "핀테크 대시보드 API 개발", type: "성공보수 수수료", amount: 3150000, paymentMethod: "국민카드 5678" },
  { id: "PAY-2025-0088", paidAt: "2025.10.15", projectTitle: "핀테크 대시보드 API 개발", type: "착수금 수수료", amount: 1050000, paymentMethod: "국민카드 5678" },
  { id: "PAY-2025-0055", paidAt: "2025.08.01", projectTitle: "앱 디자인 시스템 구축", type: "착수금 수수료", amount: 900000, paymentMethod: "신한카드 1234" },
];

const TOTAL_UPFRONT_FEE = PAYMENT_HISTORY
  .filter((payment) => payment.type === "착수금 수수료")
  .reduce((total, payment) => total + payment.amount, 0);
const TOTAL_SUCCESS_FEE = PAYMENT_HISTORY
  .filter((payment) => payment.type === "성공보수 수수료")
  .reduce((total, payment) => total + payment.amount, 0);
const TOTAL_FEE = TOTAL_UPFRONT_FEE + TOTAL_SUCCESS_FEE;

export function ClientPaymentHistory() {
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("전체");
  const visiblePayments = activeFilter === "전체"
    ? PAYMENT_HISTORY
    : PAYMENT_HISTORY.filter((payment) => payment.type === activeFilter);
  const visibleTotal = visiblePayments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-7 text-theme-primary sm:px-5">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">마이페이지</h1>

        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <ClientMyPageSidebar activeMenu="payments" />

          <div className="min-w-0 flex-1">
            <section className="grid gap-3 sm:grid-cols-3">
              <SummaryCard label="총 납부 수수료" value={TOTAL_FEE} tone="navy" />
              <SummaryCard label="착수금 수수료" value={TOTAL_UPFRONT_FEE} tone="blue" />
              <SummaryCard label="성공보수 수수료" value={TOTAL_SUCCESS_FEE} tone="purple" />
            </section>

            <section className="mt-4 rounded-xl border border-theme bg-surface px-5 py-5 sm:px-7 sm:py-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[16px] font-bold">결제 내역</h2>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_FILTERS.map((filter) => {
                    const isActive = filter === activeFilter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveFilter(filter)}
                        className={`h-8 rounded-full border px-4 text-[11px] font-semibold transition ${
                          isActive
                            ? "border-brand bg-brand text-white"
                            : "border-theme bg-surface text-theme-secondary hover:bg-surface-subtle"
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-lg border border-theme">
                <table className="w-full min-w-[760px] border-collapse text-left text-[11px]">
                  <thead className="bg-surface-subtle text-theme-muted">
                    <tr>
                      <TableHeader>결제일</TableHeader>
                      <TableHeader>프로젝트</TableHeader>
                      <TableHeader>구분</TableHeader>
                      <TableHeader>금액</TableHeader>
                      <TableHeader>결제수단</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePayments.map((payment) => (
                      <tr key={payment.id} className="border-t border-theme">
                        <td className="px-5 py-4 font-semibold text-theme-muted">{payment.paidAt}</td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-theme-primary">{payment.projectTitle}</p>
                          <p className="mt-1 text-[10px] font-semibold text-theme-muted">{payment.id}</p>
                        </td>
                        <td className="px-5 py-4"><PaymentTypeBadge type={payment.type} /></td>
                        <td className="px-5 py-4 text-[13px] font-extrabold text-theme-primary">{formatWon(payment.amount)}</td>
                        <td className="px-5 py-4 font-semibold text-theme-secondary">{payment.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-7 flex justify-end border-t border-theme pt-5 text-[11px]">
                <span className="font-semibold text-theme-muted">조회 기간 합계</span>
                <strong className="ml-3 text-[14px] text-brand">{formatWon(visibleTotal)}</strong>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "navy" | "blue" | "purple" }) {
  const colors = { navy: "text-brand", blue: "text-[#3478f6]", purple: "text-[#7c3aed]" };
  return (
    <article className="flex min-h-[108px] flex-col items-center justify-center rounded-xl border border-theme bg-surface px-4 text-center">
      <p className="text-[11px] font-semibold text-theme-muted">{label}</p>
      <strong className={`mt-3 text-[19px] font-extrabold ${colors[tone]}`}>{formatWon(value)}</strong>
    </article>
  );
}

function PaymentTypeBadge({ type }: { type: PaymentHistoryItem["type"] }) {
  const isSuccessFee = type === "성공보수 수수료";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${isSuccessFee ? "bg-[#f3ecff] text-[#7c3aed]" : "bg-[#e6f6ff] text-[#1687bd]"}`}>
      {type}
    </span>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 font-semibold">{children}</th>;
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}
