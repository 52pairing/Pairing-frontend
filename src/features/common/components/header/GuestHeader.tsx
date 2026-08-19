import Link from "next/link";
import { HeaderShell } from "./HeaderShell";

const guestNavItems = [
  { label: "클라이언트 등록", href: "/signup/client" },
  { label: "프리랜서 등록", href: "/signup/freelancer" },
];

// 비로그인 사용자에게 보여주는 Header
export function GuestHeader() {
  return (
    <HeaderShell
      homeHref="/"
      nav={guestNavItems.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-theme-primary">
          {item.label}
        </Link>
      ))}
      actions={
        <>
          <Link
            href="/login"
            className="rounded-md border border-theme bg-surface px-4 py-2 text-sm font-semibold text-theme-secondary hover:bg-surface-subtle"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:bg-brand-hover"
          >
            회원가입
          </Link>
        </>
      }
    />
  );
}
