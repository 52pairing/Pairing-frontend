import type { Metadata } from "next";

import { FreelancerContracts } from "@/features/contract/components/freelancer/FreelancerContracts";

export const metadata: Metadata = {
  title: "내 계약",
  robots: { index: false, follow: false },
};

export default function FreelancerContractsPage() {
  return <FreelancerContracts />;
}
