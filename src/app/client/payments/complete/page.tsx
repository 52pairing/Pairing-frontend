import { Suspense } from "react";

import { ProjectPaymentComplete } from "@/features/payment/components/ProjectPaymentComplete";

export default function ClientPaymentCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">
          결제 결과를 확인하고 있습니다.
        </div>
      }
    >
      <ProjectPaymentComplete />
    </Suspense>
  );
}
