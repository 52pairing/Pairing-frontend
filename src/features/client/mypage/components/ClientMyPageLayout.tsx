import type { ReactNode } from "react";

import { ClientMyPageSidebar } from "@/features/client/components/ClientMyPageSidebar";
import type { ClientMyPageActiveMenu } from "@/features/client/types/components";

interface ClientMyPageLayoutProps {
  activeMenu: ClientMyPageActiveMenu;
  children: ReactNode;
}

export function ClientMyPageLayout({ activeMenu, children }: ClientMyPageLayoutProps) {
  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-10 text-theme-primary sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-[1090px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.04em]">마이페이지</h1>
        <div className="mt-9 flex flex-col gap-6 md:flex-row md:items-start">
          <ClientMyPageSidebar activeMenu={activeMenu} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
