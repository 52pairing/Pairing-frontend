// import { ClientHeader } from "./ClientHeader";
// import { FreelancerHeader } from "./FreelancerHeader";
import { GuestHeader } from "./GuestHeader";

export type HeaderRole = "guest" | "client" | "freelancer";

interface HeaderProps {
  role?: HeaderRole;
}

/**
 * 전역 Header 진입점입니다.
 * 실제 로그인 연동 전에는 기본값으로 guest Header를 보여줍니다.
 */
export function Header({ role = "guest" }: HeaderProps) {
  if (role === "client") {
    // return <ClientHeader />;
  }

  if (role === "freelancer") {
    // return <FreelancerHeader />;
  }

  return <GuestHeader />;
}