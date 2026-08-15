"use client";

import dynamic from "next/dynamic";

import { SocialCallbackStatus } from "@/features/auth/components/SocialCallbackContent";

// sessionStorage를 사용하는 콜백 처리는 서버에서 렌더링하지 않습니다.
const SocialCallbackContent = dynamic(
  () =>
    import("@/features/auth/components/SocialCallbackContent").then(
      (module) => module.SocialCallbackContent,
    ),
  {
    ssr: false,
    loading: () => <SocialCallbackStatus />,
  },
);

export default function SocialCallbackPage() {
  return <SocialCallbackContent />;
}
