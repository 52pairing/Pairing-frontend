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
  // 단, role="guest"로 명시된 페이지(비로그인도 접근 가능한 공개 페이지)는 대부분
  // 실제로 비로그인 방문이므로, 그 다수를 위해 스켈레톤 없이 바로 게스트 헤더를 보여주고
  // 세션이 실제로 확인되면(드문 액세스 토큰 만료 케이스) 그 자리에서 자연스럽게 교체한다.
  if (isLoading && !user && role !== "guest") return <HeaderSkeleton />;

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
