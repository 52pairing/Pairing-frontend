import type { Metadata } from "next";
import { Suspense } from "react";

import { ClientContracts } from "@/features/contract/components/client/ClientContracts";

export const metadata: Metadata = {
  title: "계약 관리",
  robots: { index: false, follow: false },
};

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">계약 목록을 불러오고 있습니다.</div>}>
      <ClientContracts />
    </Suspense>
  );
}
