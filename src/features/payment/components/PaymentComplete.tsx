import Link from "next/link";
import type { ReactNode } from "react";

interface PaymentCompleteProps {
  title: string;
  status?: string;
  description: ReactNode;
  homeHref: string;
  detailHref: string;
  detailLabel: string;
}

export function PaymentComplete({
  title,
  status,
  description,
  homeHref,
  detailHref,
  detailLabel,
}: PaymentCompleteProps) {
  return (
    <main className="flex h-[calc(100dvh-60px)] items-center justify-center overflow-hidden bg-[#f7f8fa] px-5 text-[#111827]">
      <div className="text-center">
        <span className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-full border border-[#a7efc4] bg-[#dcfae6]">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
            <path d="M12 21L18 27L30 15" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className="mt-7 text-[24px] font-extrabold tracking-[-0.04em]">
          {title}
        </h1>

        {status ? (
          <p className="mt-5 text-[15px] font-bold text-[#667085]">{status}</p>
        ) : null}

        <div className="mt-6 text-[13px] font-semibold leading-7 text-[#7b8797]">
          {description}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href={homeHref}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-[10px] border border-[#dce2e8] bg-white px-7 text-[14px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]"
          >
            홈으로
          </Link>
          <Link
            href={detailHref}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-[10px] bg-[#17365d] px-8 text-[14px] font-bold text-white transition hover:bg-[#102a49]"
          >
            {detailLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
