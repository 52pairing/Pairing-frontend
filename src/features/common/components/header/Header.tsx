"use client";

import { useCurrentUserState } from "@/features/auth/hooks/useCurrentUser";
import type { CurrentUserResponse } from "@/features/auth/types";
import { useUnreadChatCount } from "@/features/chat/hooks/useUnreadChatCount";
import { useUnreadNotificationCount } from "@/features/notification/hooks/useUnreadNotificationCount";
import { ClientHeader } from "./ClientHeader";
import { FreelancerHeader } from "./FreelancerHeader";
import { GuestHeader } from "./GuestHeader";
import { HeaderSkeleton } from "./HeaderSkeleton";

export type HeaderRole = "guest" | "client" | "freelancer";

interface HeaderProps {
  role: HeaderRole;
  // 서버에서 미리 조회한 로그인 사용자. 넘기면 첫 렌더부터 올바른 헤더가 그려집니다.
  initialUser?: CurrentUserResponse | null;
  // 서버가 로그인 여부를 확인하지 못한 SSG 페이지(예: 고객지원)에서 켠다.
  // 조회가 끝나기 전엔 게스트/로그인 어느 쪽도 단정하지 않고 스켈레톤을 보여줘,
  // "게스트 헤더가 떴다가 로그인 헤더로 교체되는" 깜빡임을 없앤다.
  showSkeletonWhileResolving?: boolean;
}

// 역할에 맞는 Header를 선택해서 보여주는 진입점
export function Header({
  role = "guest",
  initialUser = null,
  showSkeletonWhileResolving = false,
}: HeaderProps) {
  const { user, isLoading } = useCurrentUserState(initialUser);
  const noticeCount = useUnreadNotificationCount(user?.accountId);
  const chatCount = useUnreadChatCount(user?.accountId);

  // 아직 로그인 여부를 모르는 동안엔 게스트/로그인 어느 쪽도 단정하지 않고 스켈레톤을 보여준다.
  // (SSR 페이지는 initialUser 덕에 isLoading=false라 이 분기를 타지 않는다.)
  // - client/freelancer 레이아웃: 로그인 전용이므로 조회 중엔 스켈레톤.
  // - guest 페이지: 서버가 로그인 여부를 확인한 SSR 페이지(홈/채팅)는 대부분 실제 비로그인
  //   방문이라 스켈레톤 없이 바로 게스트 헤더를 보여준다. 반면 서버가 확인 못 한 SSG 페이지
  //   (고객지원)는 showSkeletonWhileResolving로 켜서, 게스트→로그인 교체 깜빡임을 없앤다.
  if (isLoading && !user && (role !== "guest" || showSkeletonWhileResolving))
    return <HeaderSkeleton />;

  const currentRole = user?.role.toLowerCase() ?? role;

  if (currentRole === "client") {
    return (
      <ClientHeader
        name={user?.companyName ?? user?.name}
        isNameLoading={isLoading}
        chatCount={chatCount}
        noticeCount={noticeCount}
      />
    );
  }

  if (currentRole === "freelancer") {
    return (
      <FreelancerHeader
        name={user?.name}
        isNameLoading={isLoading}
        chatCount={chatCount}
        noticeCount={noticeCount}
      />
    );
  }

  return <GuestHeader />;
}
