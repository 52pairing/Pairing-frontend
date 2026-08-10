import type { ReactNode } from "react";

import { ClientProjectRegisterGuard } from "@/features/client/projects/components/ClientProjectRegisterGuard";
import { ProjectRegisterProvider } from "@/features/client/projects/context/ProjectRegisterContext";

/**
 * 프로젝트 등록 위저드(/client/projects/new/*) 공통 레이아웃.
 * Context Provider로 감싸 스텝 라우트를 오가도 폼 상태가 유지됩니다.
 * (App Router에서 layout은 자식 페이지 이동 시 리마운트되지 않음)
 */
export default function NewProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClientProjectRegisterGuard>
      <ProjectRegisterProvider>{children}</ProjectRegisterProvider>
    </ClientProjectRegisterGuard>
  );
}
