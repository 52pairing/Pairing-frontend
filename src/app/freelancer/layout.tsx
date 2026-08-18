import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { Header } from "@/features/common/components/header/Header";

interface FreelancerLayoutProps {
  children: ReactNode;
}

// /freelancer 하위 페이지에서 사용하는 프리랜서 전용 레이아웃입니다.
export default async function FreelancerLayout({ children }: FreelancerLayoutProps) {
  const initialUser = await getServerCurrentUser();

  // 서버가 유저를 확정 조회했고 역할이 다르면 콘텐츠 전송 전에 차단한다.
  // user===null(미상: 비로그인/토큰만료/일시오류)은 여기서 판단하지 않고,
  // 기존 클라이언트 가드(RoleGuard·AuthSessionGuard)의 로그인·refresh 흐름에 위임한다.
  if (initialUser && initialUser.role !== "FREELANCER") {
    redirect("/forbidden");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="freelancer" initialUser={initialUser} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
