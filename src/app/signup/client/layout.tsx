import type { ReactNode } from "react";

import { ClientSignupProvider } from "@/features/auth/context/ClientSignupContext";

export default function ClientSignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientSignupProvider>{children}</ClientSignupProvider>;
}
