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
    <main className="flex h-[calc(100dvh-60px)] items-center justify-center overflow-hidden bg-surface-subtle px-5 text-theme-primary">
      <section className="w-full max-w-[540px] rounded-[18px] border border-theme bg-surface px-10 py-10 text-center shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
        <span className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-full border border-[#a7efc4] bg-[#dcfae6]">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
            <path d="M12 21L18 27L30 15" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className="mt-7 text-[24px] font-extrabold tracking-[-0.04em]">
          {title}
        </h1>

        {status ? (
          <p className="mt-5 text-[15px] font-bold text-theme-secondary">{status}</p>
        ) : null}

        <div className="mt-6 border-y border-theme py-5 text-[13px] font-semibold leading-7 text-[#7b8797]">
          {description}
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href={homeHref}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-[10px] border border-theme bg-surface px-7 text-[14px] font-semibold text-theme-secondary transition hover:bg-surface-subtle"
          >
            홈으로
          </Link>
          <Link
            href={detailHref}
            className="flex h-[54px] cursor-pointer items-center justify-center rounded-[10px] bg-brand px-8 text-[14px] font-bold text-white transition hover:bg-brand"
          >
            {detailLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
