import type { ReactNode } from "react";
import Link from "next/link";

import { CheckIcon } from "./SupportIcons";

interface SupportCardProps {
  icon: ReactNode;
  title: string;
  caption: string;
  description: string;
  items: readonly string[];
  actionLabel: string;
  actionIcon?: ReactNode;
  actionHref?: string;
  emphasis?: boolean;
}

export function SupportCard({
  icon,
  title,
  caption,
  description,
  items,
  actionLabel,
  actionIcon,
  actionHref,
  emphasis = false,
}: SupportCardProps) {
  return (
    <article className="flex min-h-[314px] flex-col rounded-[14px] border border-theme bg-surface p-7 shadow-[0_1px_2px_rgb(15_23_42/0.02)] sm:p-8">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${
            emphasis ? "bg-brand text-brand-contrast" : "bg-surface-muted text-theme-secondary"
          }`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-[-0.02em] text-theme-primary">{title}</h2>
          <p className="mt-0.5 text-xs font-medium text-theme-muted">{caption}</p>
        </div>
      </div>

      <p className="mt-4 break-keep text-sm font-semibold leading-6 text-theme-secondary">
        {description}
      </p>

      <ul className="mt-4 space-y-2 text-[13px] font-medium text-theme-secondary">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckIcon className={`h-4 w-4 ${emphasis ? "text-theme-success" : "text-theme-muted"}`} />
            <span className="break-keep">{item}</span>
          </li>
        ))}
      </ul>

      {actionHref ? (
        <Link
          href={actionHref}
          className={`mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-bold ${
            emphasis
              ? "bg-brand text-brand-contrast"
              : "border-2 border-brand bg-surface text-brand hover:bg-surface-subtle"
          }`}
        >
          {actionIcon}
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          aria-disabled="true"
          title="상담 기능은 준비 중입니다"
          className={`mt-auto flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[10px] text-sm font-bold ${
          emphasis
            ? "bg-brand text-brand-contrast"
            : "border-2 border-brand bg-surface text-brand"
        }`}
        >
          {actionIcon}
          {actionLabel}
        </button>
      )}
    </article>
  );
}
