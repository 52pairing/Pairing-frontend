"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/features/common/components/Footer";

const FOOTER_HIDDEN_PATHS = [
  "/chat",
  "/support/chatbot",
  "/client/projects/new/complete",
  "/client/payments/complete",
];

// 로그인/회원가입은 하위 스텝 라우트가 많아 접두사로 전체를 제외 처리
const FOOTER_HIDDEN_PREFIXES = ["/login", "/signup"];

export function ConditionalFooter() {
  const pathname = usePathname();
  // 협상방은 화면 전체 높이를 쓰므로 푸터를 숨겨 스크롤이 생기지 않게 한다.
  // 클라이언트·프리랜서 공용이며 경로에 negotiationId 세그먼트가 붙는다.
  const isNegotiationRoom =
    /^\/(client|freelancer)\/projects\/[^/]+\/negotiation(\/[^/]+)?$/.test(pathname);

  const isHidden =
    FOOTER_HIDDEN_PATHS.includes(pathname) ||
    FOOTER_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isNegotiationRoom;

  if (isHidden) {
    return null;
  }

  return <Footer />;
}
