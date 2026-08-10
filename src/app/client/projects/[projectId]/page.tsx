import { Suspense } from "react";

import { ClientProjectDetail } from "@/features/client/myprojects/components/ClientProjectDetail";

export default function ClientProjectDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">
          프로젝트 상세를 불러오고 있습니다.
        </div>
      }
    >
      <ClientProjectDetail />
    </Suspense>
  );
}
