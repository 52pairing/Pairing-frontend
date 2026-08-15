"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPendingReviews, getReceivedReviews, getReviewSummary, getWrittenReviews } from "@/features/review/services/reviews";
import type { PendingReview, ReviewPage, ReviewSummary, WrittenReview } from "@/features/review/types/review";
import { FreelancerMyPageLayout } from "./FreelancerMyPageLayout";

type ReviewTab = "received" | "written";

export function FreelancerReviews() {
  const [tab, setTab] = useState<ReviewTab>("received");
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState<ReviewPage<WrittenReview> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPendingReviews().then(setPendingReviews).catch(() => null);
    getReviewSummary().then(setSummary).catch(() => null);
  }, []);

  useEffect(() => {
    let active = true;
    const request = tab === "received" ? getReceivedReviews(pageNumber) : getWrittenReviews(pageNumber);
    request.then((response) => { if (active) setPage(response); }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "리뷰를 불러오지 못했습니다."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, pageNumber]);

  const changeTab = (next: ReviewTab) => { setTab(next); setPageNumber(0); setPage(null); setError(""); setLoading(true); };

  return <FreelancerMyPageLayout activeMenu="reviews">
    {pendingReviews.length > 0 ? <section className="mb-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"><h2 className="text-[15px] font-extrabold">작성 가능한 리뷰</h2><div className="mt-4 space-y-2">{pendingReviews.map((review) => <Link key={review.contractId} href={`/freelancer/contracts/${review.contractId}/review`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-theme px-4 py-3 hover:bg-surface-subtle"><span><strong className="block text-[12px]">{review.projectTitle}</strong><span className="mt-1 block text-[10px] text-theme-muted">{review.counterpartName} · {formatDate(review.completedAt)}</span></span><span className="text-[11px] font-bold text-brand">리뷰 작성하기</span></Link>)}</div></section> : null}
    <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-7"><h2 className="text-[15px] font-extrabold">리뷰 관리</h2><div className="mt-4 flex border-b border-theme" role="tablist" aria-label="리뷰 구분"><Tab active={tab === "received"} onClick={() => changeTab("received")}>받은 리뷰</Tab><Tab active={tab === "written"} onClick={() => changeTab("written")}>작성한 리뷰</Tab></div>
      {tab === "received" && summary ? <div className="mt-5 flex items-center gap-3 rounded-lg bg-surface-subtle px-4 py-5"><strong className="text-[32px] leading-none">{(summary.averageScore ?? 0).toFixed(1)}</strong><div><Stars rating={summary.averageScore ?? 0} /><p className="mt-1 text-[10px] font-semibold text-theme-muted">총 {summary.reviewCount}건의 리뷰</p></div></div> : null}
      {loading ? <p className="py-10 text-center text-[12px] text-theme-muted">리뷰를 불러오는 중입니다.</p> : null}
      {error ? <p role="alert" className="py-10 text-center text-[12px] text-theme-danger">{error}</p> : null}
      {!loading && !error && page?.content.length === 0 ? <p className="py-10 text-center text-[12px] text-theme-muted">{tab === "received" ? "받은 리뷰가 없습니다." : "작성한 리뷰가 없습니다."}</p> : null}
      <div className={tab === "written" ? "mt-5 space-y-4" : "divide-y divide-theme"}>{page?.content.map((review) => tab === "written" ? <WrittenCard key={review.reviewId} review={review} /> : <ReceivedItem key={review.reviewId} review={review} />)}</div>
      {page && page.totalPages > 1 ? <div className="mt-5 flex justify-center gap-2"><button type="button" disabled={page.first} onClick={() => setPageNumber((value) => value - 1)} className="rounded-md border border-theme px-3 py-2 text-[11px] font-bold disabled:opacity-40">이전</button><span className="px-2 py-2 text-[11px] font-bold">{page.page + 1} / {page.totalPages}</span><button type="button" disabled={page.last} onClick={() => setPageNumber((value) => value + 1)} className="rounded-md border border-theme px-3 py-2 text-[11px] font-bold disabled:opacity-40">다음</button></div> : null}
    </section>
  </FreelancerMyPageLayout>;
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`relative min-w-28 px-4 pb-3 text-[13px] font-bold transition ${active ? "text-brand after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand" : "text-theme-muted hover:text-theme-secondary"}`}>{children}</button>; }
function ReceivedItem({ review }: { review: WrittenReview }) { return <article className="py-6 first:pt-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h3 className="text-[14px] font-bold">{review.reviewerName}<span className="ml-1 text-[11px] font-semibold text-theme-muted">{review.projectTitle}</span></h3>{review.content ? <p className="mt-3 text-[12px] font-semibold leading-5 text-theme-secondary">{review.content}</p> : null}</div><div className="flex shrink-0 items-center gap-3"><Stars rating={review.score} compact /><time className="text-[11px] font-semibold text-theme-muted">{formatDate(review.createdAt)}</time></div></div></article>; }
function WrittenCard({ review }: { review: WrittenReview }) { return <article className="overflow-hidden rounded-xl border border-theme"><header className="flex flex-wrap items-start justify-between gap-3 bg-surface-subtle px-5 py-4"><div><h3 className="text-[14px] font-extrabold">{review.projectTitle}</h3><time className="mt-1 block text-[10px] text-theme-muted">{formatDate(review.createdAt)}</time></div><span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-theme-muted">수정 및 삭제 불가</span></header><div className="p-4 sm:p-5"><h4 className="text-[11px] font-bold text-theme-muted">{review.reviewerName}</h4><div className="mt-3"><Stars rating={review.score} /></div>{review.content ? <p className="mt-3 text-[11px] font-semibold leading-5 text-theme-secondary">{review.content}</p> : null}</div></article>; }
function Stars({ rating, compact = false }: { rating: number; compact?: boolean }) { const rounded = Math.round(Math.max(0, Math.min(5, rating))); return <span className={`${compact ? "text-[13px]" : "text-[16px]"} tracking-[0.08em] text-amber-500`} aria-label={`${rating}점`}>{"★".repeat(rounded)}<span className="text-theme-muted">{"★".repeat(5 - rounded)}</span></span>; }
function formatDate(value: string) { return value.slice(0, 10).replaceAll("-", "."); }
