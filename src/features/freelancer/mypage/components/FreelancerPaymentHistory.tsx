"use client";

import { useState } from "react";

import { FreelancerMyPageSidebar } from "@/features/freelancer/components/FreelancerMyPageSidebar";

const PAYMENT_FILTERS = ["전체", "결제 완료", "결제 실패", "환불"] as const;
type PaymentFilter = (typeof PAYMENT_FILTERS)[number];

const PAYMENT_HISTORY = [
  {
    id: "PAY-2027-0003",
    projectTitle: "B2B 주문 관리 서비스 리뉴얼",
    company: "주식회사 오이랩",
    paymentMethod: "신한카드 1234",
    paidAt: "2027.01.02",
    amount: 744000,
    status: "결제 완료" as const,
  },
];

export function FreelancerPaymentHistory() {
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>("전체");
  const visiblePayments = activeFilter === "전체"
    ? PAYMENT_HISTORY
    : PAYMENT_HISTORY.filter((payment) => payment.status === activeFilter);
  const totalPaid = PAYMENT_HISTORY
    .filter((payment) => payment.status === "결제 완료")
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-7 text-[#172033] sm:px-5">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">마이페이지</h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <FreelancerMyPageSidebar activeMenu="payments" />

          <section className="min-w-0 flex-1 rounded-xl border border-[#dde3ea] bg-white px-5 py-6 sm:px-7">
            <h2 className="text-[16px] font-bold">수수료 결제 내역</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {PAYMENT_FILTERS.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filter)}
                    className={`h-8 rounded-full border px-4 text-[11px] font-semibold transition ${isActive ? "border-[#17365d] bg-[#17365d] text-white" : "border-[#dce2e8] bg-white text-[#667085] hover:bg-[#f8fafc]"}`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg bg-[#f7f8fa] px-4 py-4 text-[11px]">
              <p><span className="font-semibold text-[#98a2b3]">총 성공보수 납부</span> <strong className="ml-1 text-[14px]">{formatWon(totalPaid)}</strong></p>
              <p><span className="font-semibold text-[#98a2b3]">완료 프로젝트 수</span> <strong className="ml-1 text-[14px]">{PAYMENT_HISTORY.length}건</strong></p>
            </div>

            {visiblePayments.length > 0 ? (
              <div className="mt-5 divide-y divide-[#e5e9ef] border-b border-[#e5e9ef]">
                {visiblePayments.map((payment) => (
                  <article key={payment.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-[13px] font-bold">{payment.projectTitle}</h3>
                      <p className="mt-1.5 text-[11px] font-semibold text-[#98a2b3]">{payment.company} · {payment.paymentMethod} · {payment.paidAt}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <strong className="text-[16px] font-extrabold">{formatWon(payment.amount)}</strong>
                      <p className="mt-1.5"><span className="rounded-full border border-[#cbd8e6] bg-[#f4f7fa] px-2.5 py-1 text-[10px] font-semibold text-[#344054]">{payment.status}</span></p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex h-28 items-center justify-center rounded-lg border border-[#e5e9ef] text-[11px] font-semibold text-[#98a2b3]">해당 상태의 결제 내역이 없습니다.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}
