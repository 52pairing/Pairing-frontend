"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUnreadNotificationCount } from "@/features/notification/hooks/useUnreadNotificationCount";
import { ClientHeader } from "./ClientHeader";
import { FreelancerHeader } from "./FreelancerHeader";
import { GuestHeader } from "./GuestHeader";

export type HeaderRole = "guest" | "client" | "freelancer";

interface HeaderProps {
  role: HeaderRole;
}

// 역할에 맞는 Header를 선택해서 보여주는 진입점
export function Header({ role = "guest" }: HeaderProps) {
  const user = useCurrentUser();
  const currentRole = user?.role.toLowerCase() ?? role;
  const noticeCount = useUnreadNotificationCount(user?.accountId);

  if (currentRole === "client") {
    return <ClientHeader name={user?.name} noticeCount={noticeCount} />;
  }

  if (currentRole === "freelancer") {
    return <FreelancerHeader name={user?.name} noticeCount={noticeCount} />;
  }

  return <GuestHeader />;
}
