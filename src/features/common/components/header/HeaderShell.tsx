import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeControl } from "@/features/common/theme/ThemeControl";
import { ThemeLogo } from "@/features/common/theme/ThemeLogo";

interface HeaderShellProps {
  homeHref: string;
  nav: ReactNode;
  actions: ReactNode;
}

// 모든 Header가 공유하는 공통 레이아웃
// 높이 60px, 로고, 가운데 메뉴, 오른쪽 액션 영역 배치만 담당
export function HeaderShell({ homeHref, nav, actions }: HeaderShellProps) {
  return (
    <header className="top-0 z-40 h-[60px] border-b border-theme bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href={homeHref} aria-label="Pairing 홈" className="flex min-w-0 shrink items-center">
          <ThemeLogo priority />
        </Link>

        <nav className="hidden items-center gap-12 text-sm font-semibold text-theme-secondary md:flex">
          {nav}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:min-w-[180px] sm:gap-3">
          <ThemeControl />
          {actions}
        </div>
      </div>
    </header>
  );
}
