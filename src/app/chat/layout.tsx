import type { ReactNode } from "react";

import { getServerCurrentUser } from "@/features/auth/services/serverCurrentUser";
import { Header } from "@/features/common/components/header/Header";

interface ChatLayoutProps {
  children: ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const initialUser = await getServerCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header role="guest" initialUser={initialUser} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
