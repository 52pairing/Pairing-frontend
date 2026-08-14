"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getAllWrittenReviews, getPendingReviews } from "@/features/review/services/reviews";
import type { PendingReview, WrittenReview } from "@/features/review/types/review";

interface ProjectReviewsProps {
  projectId: number;
  contractIds: number[];
}

export function ProjectReviews({ projectId, contractIds }: ProjectReviewsProps) {
  const [written, setWritten] = useState<WrittenReview[]>([]);
  const [pending, setPending] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const contractIdSet = useMemo(() => new Set(contractIds), [contractIds]);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [writtenReviews, pendingReviews] = await Promise.all([
        getAllWrittenReviews(),
        getPendingReviews(),
      ]);
      setWritten(writtenReviews.filter((review) => contractIdSet.has(review.contractId)));
      setPending(pendingReviews.filter((review) => contractIdSet.has(review.contractId)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "리뷰를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [contractIdSet]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadReviews(); });
    return () => { cancelled = true; };
  }, [loadReviews]);

  return (
    <aside className="rounded-[14px] border border-theme bg-surface px-6 py-6">
      <h2 className="text-[14px] font-bold text-theme-primary">작성한 리뷰</h2>
      {isLoading ? <p className="mt-4 text-[11px] text-theme-muted">리뷰를 불러오고 있습니다.</p> : null}
      {errorMessage ? <div className="mt-4"><p role="alert" className="text-[11px] text-theme-danger">{errorMessage}</p><button type="button" onClick={() => void loadReviews()} className="mt-2 text-[11px] font-bold text-brand">다시 시도</button></div> : null}
      {!isLoading && !errorMessage ? (
        <div className="mt-4 space-y-3">
          {pending.map((review) => (
            <Link key={`pending-${review.contractId}`} href={`/client/projects/${projectId}/review?contractId=${review.contractId}`} className="flex items-center justify-between rounded-[10px] border border-theme px-4 py-3 text-[11px] font-bold text-brand hover:bg-surface-subtle">
              <span>계약 #{review.contractId}</span><span>리뷰 작성</span>
            </Link>
          ))}
          {written.map((review) => (
            <article key={review.reviewId} className="rounded-[10px] border border-theme px-4 py-3">
              <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-bold text-theme-primary">계약 #{review.contractId}</span><span aria-label={`${review.score}점`} className="text-[11px] font-bold text-[#f59e0b]">{"★".repeat(review.score)}<span className="text-theme-muted">{"★".repeat(5 - review.score)}</span></span></div>
              <p className="mt-2 whitespace-pre-line text-[11px] leading-5 text-theme-secondary">{review.content?.trim() || "작성된 내용이 없습니다."}</p>
            </article>
          ))}
          {pending.length === 0 && written.length === 0 ? <p className="text-[11px] text-theme-muted">이 프로젝트에 작성할 리뷰가 없습니다.</p> : null}
        </div>
      ) : null}
    </aside>
  );
}
