import type { ReactNode } from "react";

import { FreelancerSignupProvider } from "@/features/auth/context/FreelancerSignupContext";

export default function FreelancerSignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FreelancerSignupProvider>{children}</FreelancerSignupProvider>;
}
