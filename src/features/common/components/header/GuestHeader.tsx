import Link from "next/link";
import { HeaderShell } from "./HeaderShell";

const guestNavItems = [
  { label: "회사 소개", href: "/about" },
  { label: "클라이언트 등록", href: "/signup/client" },
  { label: "프리랜서 등록", href: "/signup/freelancer" },
];

// 비로그인 사용자에게 보여주는 Header
export function GuestHeader() {
  return (
    <HeaderShell
      nav={guestNavItems.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-gray-950">
          {item.label}
        </Link>
      ))}
      actions={
        <>
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[#142B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            회원가입
          </Link>
        </>
      }
    />
  );
}