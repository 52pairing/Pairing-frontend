"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const MAX_REVIEW_LENGTH = 500;
const STAR_SCORES = [1, 2, 3, 4, 5] as const;

export function FreelancerReviewForm() {
  const { projectId } = useParams<{ projectId: string }>();
  const [freelancerRating, setFreelancerRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [freelancerReview, setFreelancerReview] = useState("");
  const [serviceReview, setServiceReview] = useState("");
  const canSubmit = freelancerRating > 0 && serviceRating > 0;

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-surface-subtle px-4 py-8 text-theme-primary sm:px-5 sm:py-12">
      <div className="mx-auto w-full max-w-[1104px]">
        <Link href={`/client/projects/${projectId}`}>뒤로</Link>

        <div className="mt-4">
          <h1 className="text-[20px] font-extrabold tracking-[-0.04em]">
            프리랜서 평가
          </h1>
          <p className="mt-2 text-[12px] font-semibold text-theme-muted">
            AI 추천 엔진 개발 · 김개발
          </p>
        </div>

        <aside className="mt-7 rounded-xl border border-warning-border bg-warning-surface px-4 py-4 text-[12px] font-semibold leading-6 text-theme-warning sm:px-5">
          <p>⚠ 작성한 평점과 리뷰는 등록 후 수정하거나 삭제할 수 없습니다.</p>
          <p>
            회원가입 시 동의한 내용에 따라 리뷰는 서비스 메인 페이지와 홍보
            콘텐츠에 활용될 수 있습니다.
          </p>
        </aside>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <section className="rounded-xl border border-theme bg-surface px-4 py-6 sm:px-7 sm:py-7">
            <h2 className="text-[14px] font-bold">프리랜서 평가</h2>

            <div className="mt-5">
              <p
                id="freelancer-rating-label"
                className="text-[12px] font-semibold text-theme-muted"
              >
                프리랜서 별점 <span className="text-theme-danger">*</span>
              </p>
              <div
                role="radiogroup"
                aria-labelledby="freelancer-rating-label"
                aria-label="5점 만점"
                className="mt-2 flex w-fit gap-0.5"
              >
                {STAR_SCORES.map((score) => (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-label={`${score}점`}
                    aria-checked={freelancerRating === score}
                    onClick={() => setFreelancerRating(score)}
                    className={`flex h-10 w-8 items-center justify-center text-[29px] leading-none transition focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${
                      score <= freelancerRating
                        ? "text-[#f59e0b]"
                        : "text-theme-muted"
                    }`}
                  >
                    <span aria-hidden="true">★</span>
                  </button>
                ))}
              </div>
            </div>

            <label htmlFor="freelancer-review" className="sr-only">
              프리랜서 리뷰
            </label>
            <textarea
              id="freelancer-review"
              value={freelancerReview}
              maxLength={MAX_REVIEW_LENGTH}
              onChange={(event) => setFreelancerReview(event.target.value)}
              placeholder="프리랜서에 대한 솔직한 리뷰를 남겨주세요. (선택, 최대 500자)"
              className="mt-4 h-28 w-full resize-none rounded-lg border border-theme bg-surface px-4 py-3 text-[12px] leading-5 text-theme-primary outline-none placeholder:font-semibold placeholder:text-theme-muted focus:border-theme-strong focus:ring-2 focus:ring-brand/20 sm:h-[100px]"
            />
            <p
              className="mt-2 text-right text-[11px] font-semibold text-theme-muted"
              aria-live="polite"
            >
              {freelancerReview.length}/{MAX_REVIEW_LENGTH}
            </p>
          </section>

          <section className="rounded-xl border border-theme bg-surface px-4 py-6 sm:px-7 sm:py-7">
            <h2 className="text-[14px] font-bold">서비스 이용 후기</h2>

            <div className="mt-5">
              <p
                id="service-rating-label"
                className="text-[12px] font-semibold text-theme-muted"
              >
                서비스 별점 <span className="text-theme-danger">*</span>
              </p>
              <div
                role="radiogroup"
                aria-labelledby="service-rating-label"
                aria-label="5점 만점"
                className="mt-2 flex w-fit gap-0.5"
              >
                {STAR_SCORES.map((score) => (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-label={`${score}점`}
                    aria-checked={serviceRating === score}
                    onClick={() => setServiceRating(score)}
                    className={`flex h-10 w-8 items-center justify-center text-[29px] leading-none transition focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${
                      score <= serviceRating
                        ? "text-[#f59e0b]"
                        : "text-theme-muted"
                    }`}
                  >
                    <span aria-hidden="true">★</span>
                  </button>
                ))}
              </div>
            </div>

            <label htmlFor="service-review" className="sr-only">
              서비스 이용 후기
            </label>
            <textarea
              id="service-review"
              value={serviceReview}
              maxLength={MAX_REVIEW_LENGTH}
              onChange={(event) => setServiceReview(event.target.value)}
              placeholder="플랫폼 서비스 이용 후기를 남겨주세요. (선택, 최대 500자)"
              className="mt-4 h-28 w-full resize-none rounded-lg border border-theme bg-surface px-4 py-3 text-[12px] leading-5 text-theme-primary outline-none placeholder:font-semibold placeholder:text-theme-muted focus:border-theme-strong focus:ring-2 focus:ring-brand/20 sm:h-[100px]"
            />
            <p
              className="mt-2 text-right text-[11px] font-semibold text-theme-muted"
              aria-live="polite"
            >
              {serviceReview.length}/{MAX_REVIEW_LENGTH}
            </p>
          </section>

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl bg-brand text-[13px] font-bold text-brand-contrast transition hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-theme-muted"
          >
            평가 등록하기
          </button>
        </form>
      </div>
    </main>
  );
}
