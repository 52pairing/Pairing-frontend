import { ClientHeader } from "./ClientHeader";
import { FreelancerHeader } from "./FreelancerHeader";
import { GuestHeader } from "./GuestHeader";

export type HeaderRole = "guest" | "client" | "freelancer";

interface HeaderProps {
  role: HeaderRole;
}

// 역할에 맞는 Header를 선택해서 보여주는 진입점
export function Header({ role = "guest" }: HeaderProps) {
  if (role === "client") {
    return <ClientHeader />;
  }

  if (role === "freelancer") {
    return <FreelancerHeader />;
  }

  return <GuestHeader />;
}