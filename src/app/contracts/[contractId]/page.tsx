import type { Metadata } from "next";

import { ContractNotificationRedirect } from "@/features/contract/components/ContractNotificationRedirect";

export const metadata: Metadata = {
  title: "계약",
  robots: { index: false, follow: false },
};

export default function ContractNotificationPage() {
  return <ContractNotificationRedirect />;
}
