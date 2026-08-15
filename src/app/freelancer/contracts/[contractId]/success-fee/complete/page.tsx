import type { Metadata } from "next";

import { FreelancerSuccessFeeComplete } from "@/features/payment/components/FreelancerSuccessFeeComplete";

export const metadata: Metadata = {
  title: "성공보수 결제",
  robots: { index: false, follow: false },
};

export default function FreelancerSuccessFeeCompletePage() {
  return <FreelancerSuccessFeeComplete />;
}
