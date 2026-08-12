"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Header } from "@/features/common/components/header/Header";

import { getMyInquiries } from "../services/support";
import type {
  InquiryPageResponse,
  InquiryStatus,
} from "../types/support";
import { CheckIcon, InfoIcon } from "./SupportIcons";

type InquiryFilter = "ALL" | InquiryStatus;

const filters: { label: string; value: InquiryFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "대기 중", value: "PENDING" },
  { label: "답변 완료", value: "ANSWERED" },
];

function formatDate(value: string | null, fallback = "—") {
  if (!value) return fallback;
  return value.slice(0, 10).replaceAll("-", ".");
}

export function InquiryList() {
  const [filter, setFilter] = useState<InquiryFilter>("ALL");
  const [page, setPage] = useState(0);
  const [inquiryPage, setInquiryPage] = useState<InquiryPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMyInquiries({
        status: filter === "ALL" ? undefined : filter,
        page,
      })
      .then((data) => {
        if (!cancelled) setInquiryPage(data);
      })
      .catch(() => {
        if (cancelled) return;
        setInquiryPage(null);
        setErrorMessage("문의 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, page, retryCount]);

  const handleFilterChange = (nextFilter: InquiryFilter) => {
    setIsLoading(true);
    setErrorMessage("");
    setFilter(nextFilter);
    setPage(0);
  };

  const handlePageChange = (nextPage: number) => {
    setIsLoading(true);
    setErrorMessage("");
    setPage(nextPage);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRetryCount((count) => count + 1);
  };

  return (
    <>
      <Header role="guest" />
      <main className="flex-1 bg-background px-5 pb-20 pt-10 text-theme-primary sm:px-8 sm:pt-12">
        <div className="mx-auto w-full max-w-[1050px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-extrabold tracking-[-0.04em] sm:text-[32px]">
                1:1 문의
              </h1>
              <p className="mt-2 break-keep text-sm font-semibold text-theme-secondary">
                서비스 이용 중 궁금한 내용이나 도움이 필요한 사항을 관리자에게 문의할 수 있습니다.
              </p>
            </div>
            <Link
              href="/support/inquiries/new"
              className="flex h-11 w-fit shrink-0 items-center gap-2 rounded-[10px] bg-brand px-5 text-[13px] font-bold text-brand-contrast hover:bg-brand-hover"
            >
              <span className="text-2xl font-light leading-none" aria-hidden="true">
                +
              </span>
              새 문의 작성
            </Link>
          </div>

          <div className="mt-9 flex min-h-14 items-center gap-3 rounded-[11px] border border-theme bg-surface-muted px-5 py-3 text-[13px] font-semibold text-theme-primary">
            <InfoIcon className="h-[18px] w-[18px] shrink-0 text-brand" />
            <p className="break-keep">
              FAQ 챗봇 이용 여부와 관계없이 언제든 문의를 접수할 수 있습니다.
            </p>
          </div>

          <div className="mt-6 border-b border-theme" role="tablist" aria-label="문의 상태">
            <div className="flex gap-1 sm:gap-6">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.value}
                  onClick={() => handleFilterChange(item.value)}
                  className={`relative px-4 py-3.5 text-[13px] font-bold sm:px-7 ${
                    filter === item.value
                      ? "text-theme-primary after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-brand"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <section className="mt-6 overflow-hidden rounded-[13px] border border-theme bg-surface">
            <div className="hidden grid-cols-[2.2fr_1.1fr_1fr_1.1fr_1fr] gap-5 bg-surface-subtle px-7 py-4 text-[13px] font-semibold text-theme-muted md:grid">
              <span>문의 제목</span>
              <span>작성일</span>
              <span>상태</span>
              <span>답변 등록일</span>
              <span aria-hidden="true" />
            </div>

            {isLoading ? (
              <p role="status" className="px-6 py-16 text-center text-sm text-theme-secondary">
                문의 목록을 불러오고 있습니다.
              </p>
            ) : null}

            {!isLoading && errorMessage ? (
              <div role="alert" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <p className="text-sm text-theme-danger">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-contrast hover:bg-brand-hover"
                >
                  다시 시도
                </button>
              </div>
            ) : null}

            {!isLoading && !errorMessage && inquiryPage?.content.length ? (
              <ul>
                {inquiryPage.content.map((inquiry) => (
                  <li
                    key={inquiry.inquiryId}
                    className="grid gap-4 border-t border-theme px-5 py-5 first:border-t-0 md:grid-cols-[2.2fr_1.1fr_1fr_1.1fr_1fr] md:items-center md:gap-5 md:px-7"
                  >
                    <div className="min-w-0">
                      <p className="break-keep text-[13px] font-bold text-theme-primary sm:text-sm">
                        {inquiry.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-theme-muted">
                        {inquiry.inquiryNo}
                      </p>
                    </div>
                    <InquiryField label="작성일">
                      {formatDate(inquiry.createdAt)}
                    </InquiryField>
                    <InquiryField label="상태">
                      <StatusBadge status={inquiry.status} />
                    </InquiryField>
                    <InquiryField label="답변 등록일">
                      {formatDate(inquiry.answeredAt, "답변 대기중")}
                    </InquiryField>
                    <Link
                      href={`/support/inquiries/${inquiry.inquiryId}`}
                      className="w-fit text-sm font-bold text-blue-600 hover:underline"
                    >
                      상세 보기
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {!isLoading && !errorMessage && inquiryPage?.content.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-theme-secondary">
                해당 상태의 문의가 없습니다.
              </p>
            ) : null}
          </section>

          {inquiryPage && inquiryPage.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={inquiryPage.first || isLoading}
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                className="rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm font-semibold text-theme-secondary">
                {inquiryPage.page + 1} / {inquiryPage.totalPages}
              </span>
              <button
                type="button"
                disabled={inquiryPage.last || isLoading}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

function InquiryField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-theme-secondary md:block">
      <span className="w-24 shrink-0 text-xs text-theme-muted md:hidden">{label}</span>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  if (status === "ANSWERED") {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success-surface px-3 py-1.5 text-xs font-bold text-theme-success">
        <CheckIcon className="h-4 w-4" />
        답변 완료
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-warning-surface px-3 py-1.5 text-xs font-bold text-theme-warning">
      <span aria-hidden="true">◷</span>
      대기 중
    </span>
  );
}
