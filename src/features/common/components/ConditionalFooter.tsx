"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/features/common/components/Footer";

const FOOTER_HIDDEN_PATHS = [
  "/chat",
  "/client/projects/new/complete",
  "/client/payments/complete",
];

// 로그인/회원가입은 하위 스텝 라우트가 많아 접두사로 전체를 제외 처리
const FOOTER_HIDDEN_PREFIXES = ["/login", "/signup"];

export function ConditionalFooter() {
  const pathname = usePathname();
  const isNegotiationRoom = /^\/client\/projects\/[^/]+\/negotiation$/.test(pathname);

  const isHidden =
    FOOTER_HIDDEN_PATHS.includes(pathname) ||
    FOOTER_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isNegotiationRoom;

  if (isHidden) {
    return null;
  }

  return <Footer />;
}
