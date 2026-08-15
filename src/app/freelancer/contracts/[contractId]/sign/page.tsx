import type { Metadata } from "next";

import { ContractDocument } from "@/features/contract/components/common/ContractDocument";

export const metadata: Metadata = {
  title: "계약서 서명",
  robots: { index: false, follow: false },
};

export default function FreelancerContractSignPage() {
  return <ContractDocument role="freelancer" />;
}
