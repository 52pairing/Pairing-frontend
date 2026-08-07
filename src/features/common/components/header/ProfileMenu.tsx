"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProfileMenuProps {
  label: string;
  myPageHref: string;
}

// 클라이언트/프리랜서 Header에서 공통으로 사용하는 프로필 드롭다운
export function ProfileMenu({ label, myPageHref }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0b1f3a] text-xs text-white">
          P
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
        <div className="absolute right-0 top-12 z-50 w-40 rounded-md border border-slate-200 bg-white py-2 shadow-lg">
          <Link
            href={myPageHref}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            마이페이지
          </Link>
          <Link
            href="/support"
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            고객 지원
          </Link>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}