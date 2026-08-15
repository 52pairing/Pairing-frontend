import type { Metadata } from "next";

import { Support } from "@/features/support/components/Support";

// 고객지원 허브는 외부 데이터 없이 하드코딩된 정적 콘텐츠라 빌드 시 1회 정적 생성(SSG)한다.
// 헤더의 로그인 사용자 정보는 클라이언트에서 hydration 되어 채워진다.
// (초회 하드 진입 + 로그인 상태에서만 헤더가 순간 교체될 수 있으나, 공개 페이지라 대부분의 진입은 게스트/크롤러다.)
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "고객지원",
  description:
    "페어링 이용 방법과 정책을 FAQ 챗봇에 바로 물어보거나, 1:1 문의로 관리자에게 직접 도움을 받을 수 있습니다.",
  alternates: { canonical: "/support" },
  openGraph: {
    type: "website",
    title: "고객지원 | Pairing",
    description:
      "페어링 이용 방법과 정책을 FAQ 챗봇에 바로 물어보거나, 1:1 문의로 관리자에게 직접 도움을 받을 수 있습니다.",
    url: "/support",
  },
};

export default function SupportPage() {
  return <Support />;
}
