import type { ReactNode } from "react";
import { Header } from "@/features/common/components/header/Header";

interface ClientLayoutProps {
  children: ReactNode;
}

// /client 하위 페이지에서 사용하는 클라이언트 전용 레이아웃
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
