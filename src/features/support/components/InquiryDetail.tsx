"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { CurrentUserResponse } from "@/features/auth/types";
import { Header } from "@/features/common/components/header/Header";
import { ApiException } from "@/lib/api";

import { getInquiry } from "../services/support";
import type { InquiryResponse } from "../types/support";
import { CheckIcon } from "./SupportIcons";

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const [date, time = ""] = value.split("T");
  const formattedDate = date.replaceAll("-", ".");
  const formattedTime = time.slice(0, 5);
  return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
}

interface InquiryDetailProps {
  // 서버에서 미리 조회한 로그인 사용자 (헤더 깜빡임 방지용)
  initialUser?: CurrentUserResponse | null;
}

export function InquiryDetail({ initialUser = null }: InquiryDetailProps) {
  const params = useParams<{ inquiryId: string }>();
  const inquiryId = Number(params.inquiryId);
  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const isValidInquiryId = Number.isInteger(inquiryId) && inquiryId > 0;

  useEffect(() => {
    if (!isValidInquiryId) return;

    let cancelled = false;

    getInquiry(inquiryId)
      .then((data) => {
        if (!cancelled) setInquiry(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setInquiry(null);

        if (error instanceof ApiException && error.errorCode === "IQ_001") {
          setErrorMessage("존재하지 않는 문의입니다.");
        } else if (error instanceof ApiException && error.errorCode === "IQ_002") {
          setErrorMessage("본인이 작성한 문의만 확인할 수 있습니다.");
        } else {
          setErrorMessage("문의 내용을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inquiryId, isValidInquiryId, retryCount]);

  const handleRetry = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRetryCount((count) => count + 1);
  };

  const resolvedErrorMessage = isValidInquiryId
    ? errorMessage
    : "올바르지 않은 문의 번호입니다.";

  return (
    <>
      <Header role="guest" initialUser={initialUser} showSkeletonWhileResolving />
      <main className="flex-1 bg-background px-5 pb-20 pt-10 text-theme-primary sm:px-8 sm:pt-12">
        <div className="mx-auto w-full max-w-[780px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-[-0.04em] sm:text-[29px]">
                1:1 문의 상세
              </h1>
              <p className="mt-2 text-sm font-semibold text-theme-secondary">
                접수한 문의 내용과 답변을 확인할 수 있습니다.
              </p>
            </div>
            <Link
              href="/support/inquiries"
              className="shrink-0 rounded-lg border border-theme bg-surface px-4 py-2 text-sm font-bold text-theme-secondary hover:bg-surface-subtle"
            >
              1대1 문의로 돌아가기
            </Link>
          </div>

          {isLoading && isValidInquiryId ? (
            <p role="status" className="py-24 text-center text-sm text-theme-secondary">
              문의 내용을 불러오고 있습니다.
            </p>
          ) : null}

          {(!isLoading && resolvedErrorMessage) || !isValidInquiryId ? (
            <div role="alert" className="mt-10 flex flex-col items-center gap-4 rounded-[14px] border border-theme bg-surface px-6 py-20 text-center">
              <p className="text-sm text-theme-danger">{resolvedErrorMessage}</p>
              {isValidInquiryId ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-contrast hover:bg-brand-hover"
                >
                  다시 시도
                </button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && inquiry ? (
            <div className="mt-8 space-y-5">
              <section className="overflow-hidden rounded-[14px] border border-theme bg-surface">
                <div className="border-b border-theme px-6 py-5 sm:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-theme-muted">
                      문의 번호 {inquiry.inquiryNo}
                    </p>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <h2 className="mt-3 break-keep text-lg font-extrabold text-theme-primary">
                    {inquiry.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-theme-secondary">
                    작성일 {formatDateTime(inquiry.createdAt)}
                  </p>
                </div>

                <div className="px-6 py-6 sm:px-7">
                  <p className="whitespace-pre-wrap break-keep text-sm leading-7 text-theme-secondary">
                    {inquiry.content}
                  </p>

                  {inquiry.files.length > 0 ? (
                    <div className="mt-8 border-t border-theme pt-6">
                      <h3 className="text-sm font-bold text-theme-primary">첨부파일</h3>
                      <ul className="mt-3 space-y-2">
                        {inquiry.files.map((file) => (
                          <li key={file.fileId}>
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-blue-600 hover:underline"
                            >
                              <span aria-hidden="true">↗</span>
                              {file.originalName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-[13px] border border-theme bg-surface px-6 py-6 sm:px-7">
                <h2 className="text-base font-extrabold text-theme-primary">관리자 답변</h2>
                {inquiry.status === "ANSWERED" ? (
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-theme-secondary">
                      <span>{inquiry.answererName ?? "페어링 고객지원"}</span>
                      <span>{formatDateTime(inquiry.answeredAt)}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap break-keep rounded-[10px] bg-surface-subtle p-5 text-sm leading-7 text-theme-secondary">
                      {inquiry.answer}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[10px] bg-warning-surface px-5 py-6 text-sm font-semibold text-theme-warning">
                    관리자가 문의 내용을 확인하고 있습니다.
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: InquiryResponse["status"] }) {
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
