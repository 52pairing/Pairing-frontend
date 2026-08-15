"use client";

import { useCallback } from "react";

import { ClientContractCard } from "@/features/contract/components/client/ClientContractCard";
import { ListState } from "@/features/contract/components/common/ListState";
import { useAsyncData } from "@/features/contract/hooks/useAsyncData";
import { getClientProjectContracts } from "@/features/contract/services/clientContracts";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

export function ProjectContracts({ projectId }: { projectId: string }) {
  const parsedProjectId = Number(projectId);

  const loader = useCallback(async () => {
    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      throw new Error("프로젝트 정보를 확인할 수 없습니다.");
    }
    const [contracts, jobRoles] = await Promise.all([
      getClientProjectContracts(parsedProjectId),
      getProjectJobRoles(),
    ]);
    return {
      contractPage: contracts,
      jobRoleLabels: Object.fromEntries(jobRoles.map((role) => [role.code, role.label])) as Record<string, string>,
    };
  }, [parsedProjectId]);

  const { data, isLoading, error, reload } = useAsyncData(loader, "계약 목록을 불러오지 못했습니다.");
  const contracts = data?.contractPage.content ?? [];
  const jobRoleLabels = data?.jobRoleLabels ?? {};

  return (
    <ListState
      isLoading={isLoading}
      error={error}
      isEmpty={!contracts.length}
      onRetry={reload}
      loadingText="계약 목록을 불러오고 있습니다."
      emptyText="이 프로젝트에 등록된 계약이 없습니다."
      frameClassName="mt-6 h-[200px] rounded-[14px]"
      errorVariant="plain"
    >
      <section className="mt-6 space-y-3">
        {contracts.map((contract) => (
          <ClientContractCard
            key={contract.contractId}
            contract={contract}
            jobRoleLabel={jobRoleLabels[contract.jobRole] ?? contract.jobRole}
            detailHref={`/client/projects/${projectId}/contracts/${contract.contractId}`}
          />
        ))}
      </section>
    </ListState>
  );
}
