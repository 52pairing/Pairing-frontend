import type { ReactNode } from "react";

import { Header } from "@/features/common/components/header/Header";

interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="guest" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
