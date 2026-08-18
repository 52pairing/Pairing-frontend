"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientMyPageLayout } from "@/features/client/mypage/components/ClientMyPageLayout";
import { getContracts } from "@/features/contract/services/contracts";
import { getPendingReviews, getReceivedReviews, getReviewSummary, getWrittenReviews } from "@/features/review/services/reviews";
import type { PendingReview, ReviewPage, ReviewSummary, WrittenReview } from "@/features/review/types/review";

type ReviewTab = "received" | "written";

export function ClientReviewManagement() {
  const [tab, setTab] = useState<ReviewTab>("received");
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [projectIdByContract, setProjectIdByContract] = useState<Map<number, number>>(new Map());
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState<ReviewPage<WrittenReview> | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getReviewSummary().then(setSummary).catch(() => null);

    Promise.all([
      getPendingReviews(),
      getContracts({ tab: "COMPLETED", page: 0, size: 100 }),
    ])
      .then(([pending, completedPage]) => {
        setPendingReviews(pending);
        setProjectIdByContract(
          new Map(completedPage.content.map((contract) => [contract.contractId, contract.projectId])),
        );
      })
      .catch(() => null);
  }, []);
  useEffect(() => {
    let active = true;
    const request = tab === "received" ? getReceivedReviews(pageNumber) : getWrittenReviews(pageNumber);
    request.then((response) => { if (active) setPage(response); }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "리뷰를 불러오지 못했습니다."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, pageNumber]);

  const changeTab = (next: ReviewTab) => { setLoading(true); setError(""); setTab(next); setPageNumber(0); setPage(null); };
  return <ClientMyPageLayout activeMenu="reviews">
    {pendingReviews.length > 0 ? <section className="mb-4 rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8"><h2 className="text-[15px] font-extrabold">작성 가능한 리뷰</h2><div className="mt-4 space-y-2">{pendingReviews.map((review) => {
      const projectId = projectIdByContract.get(review.contractId);
      const content = <><span><strong className="block text-[12px]">{review.projectTitle}</strong><span className="mt-1 block text-[10px] text-theme-muted">{review.counterpartName} · {formatReviewDate(review.completedAt)}</span></span><span className={`text-[11px] font-bold ${projectId == null ? "text-theme-muted" : "text-brand"}`}>{projectId == null ? "계약 정보를 확인할 수 없습니다" : "리뷰 작성하기"}</span></>;

      return projectId == null ? <div key={review.contractId} aria-disabled="true" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-theme bg-surface-muted px-4 py-3">{content}</div> : <Link key={review.contractId} href={`/client/projects/${projectId}/review?contractId=${review.contractId}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-theme px-4 py-3 hover:bg-surface-subtle">{content}</Link>;
    })}</div></section> : null}
    <section className="rounded-xl border border-theme bg-surface px-5 py-6 sm:px-8 sm:py-7"><h2 className="text-[16px] font-bold">리뷰 관리</h2><div className="mt-6 flex border-b border-theme" role="tablist"><Tab active={tab === "received"} onClick={() => changeTab("received")}>받은 리뷰</Tab><Tab active={tab === "written"} onClick={() => changeTab("written")}>작성한 리뷰</Tab></div>{tab === "received" && summary ? <div className="mt-6 flex items-center gap-4 rounded-xl bg-surface-subtle px-5 py-5"><strong className="text-[34px]">{(summary.averageScore ?? 0).toFixed(1)}</strong><div><Stars rating={summary.averageScore ?? 0} /><p className="mt-1 text-[11px] font-semibold text-theme-muted">총 {summary.reviewCount}건의 리뷰</p></div></div> : null}{loading ? <p className="py-10 text-center text-[12px] text-theme-muted">리뷰를 불러오는 중입니다.</p> : null}{error ? <p role="alert" className="py-10 text-center text-[12px] text-theme-danger">{error}</p> : null}{!loading && !error && page?.content.length === 0 ? <p className="py-10 text-center text-[12px] text-theme-muted">{tab === "received" ? "받은 리뷰가 없습니다." : "작성한 리뷰가 없습니다."}</p> : null}<div className={tab === "written" ? "mt-5 space-y-4" : "divide-y divide-theme"}>{page?.content.map((review) => tab === "written" ? <WrittenReviewCard key={review.reviewId} review={review} /> : <ReceivedReviewItem key={review.reviewId} review={review} />)}</div>{page && page.totalPages > 1 ? <div className="mt-5 flex justify-center gap-2"><button type="button" disabled={page.first} onClick={() => setPageNumber((value) => value - 1)} className="rounded-md border border-theme px-3 py-2 text-[11px] font-bold disabled:opacity-40">이전</button><span className="px-2 py-2 text-[11px] font-bold">{page.page + 1} / {page.totalPages}</span><button type="button" disabled={page.last} onClick={() => setPageNumber((value) => value + 1)} className="rounded-md border border-theme px-3 py-2 text-[11px] font-bold disabled:opacity-40">다음</button></div> : null}</section>
  </ClientMyPageLayout>;
}

function ReceivedReviewItem({ review }: { review: WrittenReview }) { return <article className="py-5 first:pt-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-[14px] font-bold">{review.reviewerName}<span className="ml-1 text-[11px] font-semibold text-theme-muted">{review.projectTitle}</span></p>{review.content ? <p className="mt-3 text-[12px] font-semibold leading-5 text-theme-secondary">{review.content}</p> : null}</div><div className="flex shrink-0 items-center gap-3"><Stars rating={review.score} compact /><time className="text-[11px] font-semibold text-theme-muted">{formatReviewDate(review.createdAt)}</time></div></div></article>; }

function WrittenReviewCard({ review }: { review: WrittenReview }) { return <article className="overflow-hidden rounded-xl border border-theme"><header className="flex flex-wrap items-start justify-between gap-3 bg-surface-subtle px-5 py-4"><div><h3 className="text-[14px] font-extrabold">{review.projectTitle}</h3><p className="mt-1 text-[10px] font-semibold text-theme-muted">{formatReviewDate(review.createdAt)}</p></div><span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-bold text-theme-muted">수정 및 삭제 불가</span></header><div className="p-4 sm:p-5"><ReviewDetail title={review.reviewerName} score={review.score} content={review.content} /></div></article>; }

function ReviewDetail({ title, score, content }: { title: string; score: number; content: string | null }) { return <div className="rounded-lg border border-theme bg-surface px-4 py-4"><h4 className="text-[11px] font-bold text-theme-muted">{title}</h4><div className="mt-3"><Stars rating={score} /></div><p className="mt-3 text-[12px] font-semibold leading-5 text-theme-secondary">{content || "작성한 내용이 없습니다."}</p></div>; }
function formatReviewDate(value: string) { return value.slice(0, 10).replaceAll("-", "."); }

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`relative min-w-[96px] px-4 pb-3 text-[13px] font-bold transition ${active ? "text-brand after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand" : "text-theme-muted hover:text-theme-secondary"}`}>{children}</button>; }
function Stars({ rating, compact = false }: { rating: number; compact?: boolean }) { const rounded = Math.round(Math.max(0, Math.min(5, rating))); return <span aria-label={`평점 ${rating}점`} className={`${compact ? "text-[13px]" : "text-[16px]"} tracking-[0.08em] text-amber-500`}>{"★".repeat(rounded)}<span className="text-theme-muted">{"★".repeat(5 - rounded)}</span></span>; }
