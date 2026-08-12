import { Suspense } from "react";

import { ClientContracts } from "@/features/client/contracts/components/ClientContracts";

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">계약 목록을 불러오고 있습니다.</div>}>
      <ClientContracts />
    </Suspense>
  );
}
