import type { ReactNode } from "react";

import { FreelancerSocialSignupProvider } from "@/features/auth/context/FreelancerSocialSignupContext";

export default function FreelancerSocialSignupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <FreelancerSocialSignupProvider>{children}</FreelancerSocialSignupProvider>
  );
}
