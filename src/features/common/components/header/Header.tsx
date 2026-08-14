"use client";

import { useCurrentUserState } from "@/features/auth/hooks/useCurrentUser";
import type { CurrentUserResponse } from "@/features/auth/types";
import { useUnreadNotificationCount } from "@/features/notification/hooks/useUnreadNotificationCount";
import { ClientHeader } from "./ClientHeader";
import { FreelancerHeader } from "./FreelancerHeader";
import { GuestHeader } from "./GuestHeader";

export type HeaderRole = "guest" | "client" | "freelancer";

interface HeaderProps {
  role: HeaderRole;
  // 서버에서 미리 조회한 로그인 사용자. 넘기면 첫 렌더부터 올바른 헤더가 그려집니다.
  initialUser?: CurrentUserResponse | null;
}

// 역할에 맞는 Header를 선택해서 보여주는 진입점
export function Header({ role = "guest", initialUser = null }: HeaderProps) {
  const { user, isLoading } = useCurrentUserState(initialUser);
  const currentRole = user?.role.toLowerCase() ?? role;
  const noticeCount = useUnreadNotificationCount(user?.accountId);

  if (currentRole === "client") {
    return <ClientHeader name={user?.name} isNameLoading={isLoading} noticeCount={noticeCount} />;
  }

  if (currentRole === "freelancer") {
    return <FreelancerHeader name={user?.name} isNameLoading={isLoading} noticeCount={noticeCount} />;
  }

  return <GuestHeader />;
}
