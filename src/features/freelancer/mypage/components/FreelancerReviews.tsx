"use client";

import { useState } from "react";

import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

type ReviewTab = "received" | "written";
const receivedReviews = [
  { name: "주식회사 오이팀", project: "B2B 주문 관리 서비스 리뉴얼", rating: 5, date: "2027.01.02", content: "일정 준수가 정확하고 결과물의 완성도가 높았습니다." },
  { name: "파이낸스온", project: "핀테크 대시보드 개발", rating: 5, date: "2026.08.10", content: "소통이 원활하고 요구사항 이해도가 뛰어납니다." },
];

export function FreelancerReviews() {
  const [tab, setTab] = useState<ReviewTab>("received");

  return (
    <FreelancerMyPageLayout activeMenu="reviews">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7">
        <h2 className="text-[15px] font-extrabold">리뷰 관리</h2>
        <div className="mt-4 flex border-b border-theme" role="tablist" aria-label="리뷰 구분">
          <TabButton active={tab === "received"} onClick={() => setTab("received")}>받은 리뷰</TabButton>
          <TabButton active={tab === "written"} onClick={() => setTab("written")}>작성한 리뷰</TabButton>
        </div>
        {tab === "received" ? <ReceivedReviews /> : <WrittenReview />}
      </section>
    </FreelancerMyPageLayout>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`relative min-w-28 px-4 pb-3 text-[11px] font-bold ${active ? "text-brand after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand" : "text-theme-muted"}`}>{children}</button>;
}

function ReceivedReviews() {
  return <div><div className="mt-5 flex items-center gap-3 rounded-lg bg-surface-subtle px-4 py-5"><strong className="text-[32px] leading-none">4.8</strong><div><Stars rating={5} /><p className="mt-1 text-[10px] font-semibold text-theme-muted">총 17건의 리뷰</p></div></div><div className="divide-y divide-theme">{receivedReviews.map((review) => <article key={`${review.name}-${review.date}`} className="py-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[12px] font-extrabold">{review.name}</h3><span className="text-[10px] font-semibold text-theme-muted">{review.project}</span></div><div className="flex items-center gap-3"><Stars rating={review.rating} /><time className="text-[10px] text-theme-muted">{review.date}</time></div></div><p className="mt-3 text-[11px] font-semibold leading-5 text-theme-secondary">{review.content}</p></article>)}</div></div>;
}

function WrittenReview() {
  return <div className="pt-5"><article className="pb-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[12px] font-extrabold">김개발</h3><span className="text-[10px] font-semibold text-theme-muted">B2B 주문 관리 서비스 리뉴얼</span></div><time className="text-[10px] text-theme-muted">2027.01.02</time></div><Stars rating={5} /><p className="mt-3 text-[11px] font-semibold leading-5 text-theme-secondary">소통이 원활하고 요구사항이 명확하여 프로젝트를 순조롭게 진행할 수 있었습니다.</p><span className="mt-4 inline-flex rounded-md border border-theme px-3 py-2 text-[10px] font-bold text-theme-muted">수정 및 삭제 불가</span></article><div className="border-t border-theme pt-5"><h3 className="text-[11px] font-bold text-theme-muted">서비스 이용 후기</h3><div className="mt-4 rounded-lg border border-theme px-4 py-5"><Stars rating={5} /><p className="mt-3 text-[11px] font-semibold leading-5 text-theme-secondary">매칭부터 계약까지 전 과정이 투명하고 편리했습니다.</p></div></div></div>;
}

function Stars({ rating }: { rating: number }) { return <span className="text-[15px] tracking-1 text-amber-500" aria-label={`${rating}점`}>{"★".repeat(rating)}<span className="text-theme-muted">{"★".repeat(5 - rating)}</span></span>; }
