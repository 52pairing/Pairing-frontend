import type { ReactNode } from "react";
import { Header } from "@/features/common/components/header/Header";

interface FreelancerLayoutProps {
  children: ReactNode;
}

// /freelancer 하위 페이지에서 사용하는 프리랜서 전용 레이아웃입니다.
export default function FreelancerLayout({ children }: FreelancerLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="freelancer" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
