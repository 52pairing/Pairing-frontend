"use client";

import { useState } from "react";

import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";

type ReviewTab = "received" | "written";

const RECEIVED_REVIEWS = [
  {
    id: 1,
    author: "김개발",
    project: "B2B 주문 관리 서비스 리뉴얼",
    rating: 5,
    date: "2027.01.02",
    content: "일정 준수가 정확하고 결과물의 완성도가 높았습니다.",
  },
  {
    id: 2,
    author: "김서버",
    project: "핀테크 대시보드 개발",
    rating: 5,
    date: "2026.08.10",
    content: "소통이 원활하고 요구사항 이해도가 뛰어납니다.",
  },
] as const;

const WRITTEN_REVIEW = {
  target: "주식회사 오이랩",
  project: "B2B 주문 관리 서비스 리뉴얼",
  date: "2027.01.02",
  freelancerRating: 5,
  freelancerReview:
    "소통이 원활하고 요구사항이 명확하여 프로젝트를 순조롭게 진행할 수 있었습니다.",
  serviceRating: 5,
  serviceReview: "매칭부터 계약까지 전 과정이 투명하고 편리했습니다.",
};

export function ClientReviewManagement() {
  const [tab, setTab] = useState<ReviewTab>("received");

  return (
    <ClientMyPageLayout activeMenu="reviews">
      <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8 sm:py-7">
        <h2 className="text-[16px] font-bold">리뷰 관리</h2>
        <div
          className="mt-6 flex border-b border-theme"
          role="tablist"
          aria-label="리뷰 구분"
        >
          <ReviewTabButton
            active={tab === "received"}
            onClick={() => setTab("received")}
          >
            받은 리뷰
          </ReviewTabButton>
          <ReviewTabButton
            active={tab === "written"}
            onClick={() => setTab("written")}
          >
            작성한 리뷰
          </ReviewTabButton>
        </div>
        {tab === "received" ? <ReceivedReviews /> : <WrittenReviews />}
      </section>
    </ClientMyPageLayout>
  );
}

function ReviewTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative min-w-[96px] px-4 pb-3 text-[13px] font-bold transition ${active ? "text-brand" : "text-theme-muted hover:text-theme-secondary"}`}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
      ) : null}
    </button>
  );
}

function ReceivedReviews() {
  return (
    <div role="tabpanel">
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface-subtle px-5 py-5">
        <strong className="text-[36px] font-extrabold leading-none tracking-[-0.04em]">
          4.8
        </strong>
        <div>
          <StarRating rating={5} />
          <p className="mt-1 text-[11px] font-semibold text-theme-muted">
            총 17건의 리뷰
          </p>
        </div>
      </div>
      <div className="mt-5 divide-y divide-theme">
        {RECEIVED_REVIEWS.map((review) => (
          <article key={review.id} className="py-5 first:pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-bold">
                  {review.author}{" "}
                  <span className="ml-1 text-[11px] font-semibold text-theme-muted">
                    {review.project}
                  </span>
                </p>
                <p className="mt-3 text-[12px] font-semibold leading-5 text-theme-secondary">
                  {review.content}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StarRating rating={review.rating} compact />
                <time className="text-[11px] font-semibold text-theme-muted">
                  {review.date}
                </time>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function WrittenReviews() {
  return (
    <div role="tabpanel" className="pt-5">
      <article className="border-b border-theme pb-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[14px] font-bold">
              {WRITTEN_REVIEW.target}{" "}
              <span className="ml-1 text-[11px] font-semibold text-theme-muted">
                {WRITTEN_REVIEW.project}
              </span>
            </p>
            <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-theme-secondary">
              수정 및 삭제 불가
            </span>
          </div>
          <time className="text-[11px] font-semibold text-theme-muted">
            {WRITTEN_REVIEW.date}
          </time>
        </div>
        <div className="mt-3">
          <StarRating rating={WRITTEN_REVIEW.freelancerRating} />
        </div>
        <p className="mt-2 text-[12px] font-semibold leading-5 text-theme-secondary">
          {WRITTEN_REVIEW.freelancerReview}
        </p>
      </article>
      <div className="pt-5">
        <h3 className="text-[12px] font-bold text-theme-muted">
          서비스 이용 후기
        </h3>
        <div className="mt-3 rounded-xl border border-theme px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <StarRating rating={WRITTEN_REVIEW.serviceRating} />
            <time className="text-[11px] font-semibold text-theme-muted">
              {WRITTEN_REVIEW.date}
            </time>
          </div>
          <p className="mt-3 text-[12px] font-semibold leading-5 text-theme-secondary">
            {WRITTEN_REVIEW.serviceReview}
          </p>
        </div>
      </div>
    </div>
  );
}

function StarRating({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={`평점 ${rating}점`}
      className={`${compact ? "text-[13px]" : "text-[16px]"} tracking-[0.08em] text-amber-500`}
    >
      {Array.from({ length: 5 }, (_, index) =>
        index < rating ? "★" : "☆",
      ).join("")}
    </span>
  );
}
