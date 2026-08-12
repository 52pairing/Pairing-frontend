"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ClientContractTabs, CLIENT_CONTRACT_TABS } from "@/features/client/contracts/components/ClientContractTabs";
import { ClientContractCard } from "@/features/client/myprojects/contract/components/ClientContractCard";
import { getAllClientContracts } from "@/features/client/myprojects/contract/services/contracts";
import type { ClientContractListItem, ClientContractTab } from "@/features/client/myprojects/contract/types/contract";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

const isContractTab = (value: string | null): value is ClientContractTab =>
  CLIENT_CONTRACT_TABS.some(({ tab }) => tab === value);

const matchesTab = (contract: ClientContractListItem, tab: ClientContractTab) => {
  if (tab === "CLIENT_PENDING") return !contract.clientSigned;
  if (tab === "CLIENT_SIGNED") return contract.clientSigned && !contract.freelancerSigned;
  if (tab === "ALL_SIGNED") return contract.clientSigned && contract.freelancerSigned;
  return true;
};

export function ClientContracts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ClientContractTab>(isContractTab(queryTab) ? queryTab : "ALL");
  const [contracts, setContracts] = useState<ClientContractListItem[]>([]);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [items, jobRoles] = await Promise.all([
        getAllClientContracts(),
        getProjectJobRoles(),
      ]);
      setContracts(items);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((role) => [role.code, role.label])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "계약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadContracts(); });
    return () => { cancelled = true; };
  }, [loadContracts]);

  const visibleContracts = useMemo(
    () => contracts.filter((contract) => matchesTab(contract, activeTab)),
    [activeTab, contracts],
  );

  const changeTab = (tab: ClientContractTab) => {
    setActiveTab(tab);
    router.replace(`/client/contracts?tab=${tab}`, { scroll: false });
  };

  return (
    <main className="min-h-screen bg-surface-subtle">
      <div className="mx-auto w-full max-w-[1040px] px-6 pb-16 pt-5">
        <h1 className="text-[23px] font-bold tracking-[-0.6px] text-theme-primary">계약 관리</h1>
        <p className="mt-2 text-[12px] font-medium text-theme-secondary">프로젝트별 계약과 서명 진행 상태를 확인할 수 있습니다.</p>

        <ClientContractTabs activeTab={activeTab} onTabChange={changeTab} />

        {errorMessage ? (
          <div role="alert" className="mt-6 flex h-[180px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[#fda29b] bg-surface text-[12px] text-theme-danger"><p>{errorMessage}</p><button type="button" onClick={() => void loadContracts()} className="rounded-[8px] border border-[#b42318] px-4 py-2 font-bold">다시 시도</button></div>
        ) : isLoading ? (
          <div className="mt-6 flex h-[180px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-secondary">계약 목록을 불러오고 있습니다.</div>
        ) : visibleContracts.length ? (
          <section className="mt-6 space-y-3">
            {visibleContracts.map((contract) => (
              <ClientContractCard
                key={contract.contractId}
                contract={contract}
                jobRoleLabel={jobRoleLabels[contract.jobRole] ?? contract.jobRole}
                detailHref={`/client/projects/${contract.projectId}/contracts/${contract.contractId}`}
              />
            ))}
          </section>
        ) : (
          <div className="mt-6 flex h-[180px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-muted">해당 상태의 계약이 없습니다.</div>
        )}
      </div>
    </main>
  );
}
