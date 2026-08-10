import { Suspense } from "react";

import { ClientProjects } from "@/features/client/myprojects/components/ClientProjects";

export default function ClientProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#667085]">
          프로젝트 목록을 불러오고 있습니다.
        </div>
      }
    >
      <ClientProjects />
    </Suspense>
  );
}
