import Link from "next/link";

import type { CurrentUserResponse } from "@/features/auth/types";
import { Header } from "@/features/common/components/header/Header";

interface InquiryCompleteProps {
  // 서버에서 미리 조회한 로그인 사용자 (헤더 깜빡임 방지용)
  initialUser?: CurrentUserResponse | null;
}

export function InquiryComplete({ initialUser = null }: InquiryCompleteProps) {
  return (
    <>
      <Header role="guest" initialUser={initialUser} showSkeletonWhileResolving />
      <main className="flex flex-1 bg-background px-5 py-10 text-theme-primary sm:px-8 sm:py-14">
        <section className="mx-auto flex min-h-[380px] w-full max-w-[640px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[420px]">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-success-surface text-theme-success">
            <SuccessIcon />
          </span>

          <h1 className="mt-6 text-[25px] font-extrabold tracking-[-0.04em] sm:text-[28px]">
            문의가 접수되었습니다.
          </h1>
          <p className="mt-4 break-keep text-sm font-semibold text-theme-secondary sm:text-base">
            관리자가 문의 내용을 확인한 후 답변을 등록합니다.
          </p>
          <p className="mt-2 break-keep text-[13px] font-medium text-theme-muted sm:text-sm">
            답변이 등록되면 알림을 통해 안내해 드립니다.
          </p>

          <div className="mt-8 flex w-full max-w-[340px] flex-col gap-3 sm:flex-row">
            <Link
              href="/support/inquiries"
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] border-2 border-brand bg-surface px-5 text-sm font-bold text-brand hover:bg-surface-subtle"
            >
              문의 내역 확인
            </Link>
            <Link
              href="/support/inquiries"
              className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-brand px-5 text-sm font-bold text-brand-contrast hover:bg-brand-hover"
            >
              목록으로 이동
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function SuccessIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="3" />
      <path d="m15.5 24.5 5.5 5.5 12-13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
