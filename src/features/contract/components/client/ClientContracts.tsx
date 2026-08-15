"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { ClientContractTabs, CLIENT_CONTRACT_TABS } from "@/features/contract/components/client/ClientContractTabs";
import { ClientContractCard } from "@/features/contract/components/client/ClientContractCard";
import { ListState } from "@/features/contract/components/common/ListState";
import { useAsyncData } from "@/features/contract/hooks/useAsyncData";
import { getContracts, getContractTabCounts } from "@/features/contract/services/contracts";
import type { ClientContractTab } from "@/features/contract/types/clientContract";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

const PAGE_SIZE = 10;

// tab-counts 는 역할 구분 없이 8개 탭을 모두 내려주므로 클라이언트 탭만 골라 배지에 사용한다.
const CLIENT_TABS = new Set<ClientContractTab>(["ALL", "AWAITING_ME", "AWAITING_COUNTERPART", "CONCLUDED"]);

const isContractTab = (value: string | null): value is ClientContractTab =>
  CLIENT_CONTRACT_TABS.some(({ tab }) => tab === value);

export function ClientContracts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ClientContractTab>(isContractTab(queryTab) ? queryTab : "ALL");
  const [page, setPage] = useState(0);

  // 목록은 서버에서 탭 필터 + 페이지네이션(정렬 id DESC 고정)으로 받는다.
  const loadContracts = useCallback(
    () => getContracts({ tab: activeTab, page, size: PAGE_SIZE }),
    [activeTab, page],
  );
  const { data: contractPage, isLoading, error, reload } = useAsyncData(loadContracts, "계약 목록을 불러오지 못했습니다.");

  // 직무 라벨·탭 배지는 계정 단위 메타라 한 번만 로드한다. 실패해도 목록 렌더는 막지 않는다.
  const loadMeta = useCallback(async () => {
    const [jobRoles, countRows] = await Promise.all([
      getProjectJobRoles().catch(() => []),
      getContractTabCounts().catch(() => []),
    ]);
    return {
      jobRoleLabels: Object.fromEntries(jobRoles.map((role) => [role.code, role.label])) as Record<string, string>,
      tabRows: countRows.flatMap((row) => CLIENT_TABS.has(row.tab as ClientContractTab)
        ? [{ tab: row.tab as ClientContractTab, label: row.label, count: row.count }]
        : []),
    };
  }, []);
  const { data: meta } = useAsyncData(loadMeta);
  const jobRoleLabels = meta?.jobRoleLabels ?? {};
  const tabRows = meta?.tabRows ?? [];

  const changeTab = (tab: ClientContractTab) => {
    setActiveTab(tab);
    setPage(0);
    router.replace(`/client/contracts?tab=${tab}`, { scroll: false });
  };

  const contracts = contractPage?.content ?? [];

  return (
    <main className="min-h-screen bg-surface-subtle">
      <div className="mx-auto w-full max-w-[1040px] px-6 pb-16 pt-5">
        <h1 className="text-[23px] font-bold tracking-[-0.6px] text-theme-primary">계약 관리</h1>
        <p className="mt-2 text-[12px] font-medium text-theme-secondary">프로젝트별 계약과 서명 진행 상태를 확인할 수 있습니다.</p>

        <ClientContractTabs activeTab={activeTab} onTabChange={changeTab} rows={tabRows} />

        <ListState
          isLoading={isLoading}
          error={error}
          isEmpty={!contracts.length}
          onRetry={reload}
          loadingText="계약 목록을 불러오고 있습니다."
          emptyText="해당 상태의 계약이 없습니다."
          frameClassName="mt-6 h-[180px] rounded-[14px]"
        >
          <section className="mt-6 space-y-3">
            {contracts.map((contract) => (
              <ClientContractCard
                key={contract.contractId}
                contract={contract}
                jobRoleLabel={jobRoleLabels[contract.jobRole] ?? contract.jobRole}
                detailHref={`/client/projects/${contract.projectId}/contracts/${contract.contractId}`}
              />
            ))}
          </section>
          {contractPage && contractPage.totalPages > 1 ? (
            <nav aria-label="계약 목록 페이지" className="mt-6 flex items-center justify-center gap-3">
              <button type="button" disabled={contractPage.first || isLoading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-theme bg-surface px-4 py-2 text-[11px] font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:text-theme-muted">이전</button>
              <span className="text-[11px] font-semibold text-theme-secondary">{contractPage.page + 1} / {contractPage.totalPages}</span>
              <button type="button" disabled={contractPage.last || isLoading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-theme bg-surface px-4 py-2 text-[11px] font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:text-theme-muted">다음</button>
            </nav>
          ) : null}
        </ListState>
      </div>
    </main>
  );
}
