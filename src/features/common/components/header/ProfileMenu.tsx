"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { logout } from "@/features/auth/services/logout";

interface ProfileMenuProps {
  label: string;
  myPageHref: string;
}

// 클라이언트/프리랜서 Header에서 공통으로 사용하는 프로필 드롭다운
export function ProfileMenu({ label, myPageHref }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = label.trim().charAt(0) || "P";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패와 관계없이 아래에서 로그인 화면으로 이동합니다.
    } finally {
      // 로그아웃 API가 실패해도 인증 화면으로 이동해 프론트 흐름을 초기화합니다.
      window.location.replace("/login");
    }
  };

  // 드롭다운 바깥을 클릭하면 메뉴를 닫습니다.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-md border border-theme bg-surface px-3 text-sm font-semibold text-theme-secondary hover:bg-surface-subtle"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs text-white">
          {initial}
        </span>
        <span>{label}</span>
        <span className="flex items-center">
            <Image
                src="/icons/ChevronDownIcon.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                className="shrink-0"
            />
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-40 rounded-md border border-theme bg-surface py-2 shadow-lg">
          <Link
            href={myPageHref}
            className="block px-4 py-2 text-sm text-theme-secondary hover:bg-surface-subtle"
          >
            마이페이지
          </Link>
          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-theme-secondary hover:bg-surface-subtle"
          >
            고객 지원
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="block w-full px-4 py-2 text-left text-sm text-theme-danger hover:bg-danger-surface disabled:cursor-not-allowed disabled:text-theme-muted"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
