import type { ReactNode } from "react";

import {
  FreelancerMyPageSidebar,
  type FreelancerMyPageActiveMenu,
} from "@/features/freelancer/components/FreelancerMyPageSidebar";

interface FreelancerMyPageLayoutProps {
  activeMenu: FreelancerMyPageActiveMenu;
  children: ReactNode;
}

export function FreelancerMyPageLayout({
  activeMenu,
  children,
}: FreelancerMyPageLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-surface-subtle px-4 py-8 text-theme-primary sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-[1105px]">
        <h1 className="text-[23px] font-extrabold tracking-[-0.04em] sm:text-[26px]">
          마이페이지
        </h1>
        <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
          <FreelancerMyPageSidebar activeMenu={activeMenu} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
