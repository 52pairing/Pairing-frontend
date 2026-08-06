import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface HeaderShellProps {
    nav: ReactNode;
    actions: ReactNode;
}

// 모든 Header가 공유하는 공통 레이아웃
// 로고, 중앙 nav, 우측 영역의 배치만 담당

export function HeaderShell({ nav, actions }: HeaderShellProps) {
  return (
    <header className="top-0 z-40 h-[60px] border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full items-center justify-between px-8">
        <Link href="/" aria-label="Pairing 홈" className="flex items-center">
          <Image
            src="/images/Pairing_Logo.png"
            alt="Pairing"
            width={110}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-12 text-sm font-semibold text-[#374151] md:flex">
          {nav}
        </nav>

        <div className="flex min-w-[180px] items-center justify-end gap-3">
          {actions}
        </div>
      </div>
    </header>
  );
}