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
}

// 역할에 맞는 Header를 선택해서 보여주는 진입점
export function Header({ role = "guest", initialUser = null }: HeaderProps) {
  const { user, isLoading } = useCurrentUserState(initialUser);
  const noticeCount = useUnreadNotificationCount(user?.accountId);
  const chatCount = useUnreadChatCount(user?.accountId);

  // 서버가 사용자 정보를 못 넘긴 정적(SSG) 페이지의 하드 진입처럼, 아직 로그인 여부를
  // 모르는 동안엔 게스트/로그인 어느 쪽도 단정하지 않고 스켈레톤을 보여준다.
  // (SSR 페이지는 initialUser 덕에 isLoading=false라 이 분기를 타지 않는다.)
  if (isLoading && !user) return <HeaderSkeleton />;

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
