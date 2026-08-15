import type { Metadata } from "next";

import { ContractOverview } from "@/features/contract/components/common/ContractOverview";

export const metadata: Metadata = {
  title: "계약 상세",
  robots: { index: false, follow: false },
};

export default function ClientContractDetailPage() {
  return <ContractOverview role="client" />;
}
