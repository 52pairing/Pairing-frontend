"use client";

import { useCallback, useEffect, useState } from "react";

import { ClientContractCard } from "@/features/contract/components/client/ClientContractCard";
import { getClientProjectContracts } from "@/features/contract/services/clientContracts";
import type { ClientContractPage } from "@/features/contract/types/clientContract";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

export function ProjectContracts({ projectId }: { projectId: string }) {
  const parsedProjectId = Number(projectId);
  const [contractPage, setContractPage] = useState<ClientContractPage | null>(null);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadContracts = useCallback(async () => {
    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      setErrorMessage("프로젝트 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [contracts, jobRoles] = await Promise.all([
        getClientProjectContracts(parsedProjectId),
        getProjectJobRoles(),
      ]);
      setContractPage(contracts);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((role) => [role.code, role.label])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [parsedProjectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadContracts();
    });
    return () => {
      cancelled = true;
    };
  }, [loadContracts]);

  if (isLoading) {
    return <div className="mt-6 flex h-[200px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-secondary">계약 목록을 불러오고 있습니다.</div>;
  }

  if (errorMessage) {
    return (
      <div className="mt-6 flex h-[200px] flex-col items-center justify-center gap-4 rounded-[14px] border border-theme bg-surface">
        <p role="alert" className="text-[12px] text-theme-danger">{errorMessage}</p>
        <button type="button" onClick={() => void loadContracts()} className="rounded-[8px] bg-brand px-4 py-2 text-[12px] font-bold text-white">다시 시도</button>
      </div>
    );
  }

  if (!contractPage?.content.length) {
    return <div className="mt-6 flex h-[200px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-muted">이 프로젝트에 등록된 계약이 없습니다.</div>;
  }

  return (
    <section className="mt-6 space-y-3">
      {contractPage.content.map((contract) => (
        <ClientContractCard
          key={contract.contractId}
          contract={contract}
          jobRoleLabel={jobRoleLabels[contract.jobRole] ?? contract.jobRole}
          detailHref={`/client/projects/${projectId}/contracts/${contract.contractId}`}
        />
      ))}
    </section>
  );
}
