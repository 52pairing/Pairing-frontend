"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getClientProjectContracts } from "@/features/client/myprojects/contract/services/contracts";
import type { ClientContractListItem } from "@/features/client/myprojects/contract/types/contract";
import { getClientProjectDetail } from "@/features/client/myprojects/services/projectDetail";
import type { ClientProjectDetailResponse } from "@/features/client/myprojects/types/projectDetail";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";
import { getMySettlements } from "@/features/payment/services/settlementPayment";
import type { SettlementResponse } from "@/features/payment/types/payment";

interface SuccessFeeCompleteProps {
  role: "client" | "freelancer";
}

const PERIOD_UNIT_LABEL: Record<string, string> = {
  DAY: "일",
  WEEK: "주",
  MONTH: "개월",
  YEAR: "년",
};

const formatDate = (value: string | null) => value ? value.slice(0, 10).replaceAll("-", ".") : "-";
const formatAmount = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function SuccessFeeComplete({ role }: SuccessFeeCompleteProps) {
  const params = useParams<{ projectId?: string; contractId?: string }>();
  const projectId = Number(params.projectId);
  const [project, setProject] = useState<ClientProjectDetailResponse | null>(null);
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [contracts, setContracts] = useState<ClientContractListItem[]>([]);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(role === "client");
  const [errorMessage, setErrorMessage] = useState("");

  const loadSummary = useCallback(async () => {
    if (role !== "client") {
      setIsLoading(false);
      return;
    }
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setErrorMessage("프로젝트 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const projectDetail = await getClientProjectDetail(projectId);
      const contractSize = Math.max(10, projectDetail.confirmedHeadcount);
      const [settlementPage, contractPage, jobRoles] = await Promise.all([
        getMySettlements(projectId, 0, 10),
        getClientProjectContracts(projectId, 0, contractSize),
        getProjectJobRoles(),
      ]);

      setProject(projectDetail);
      setSettlements(settlementPage.content);
      setContracts(contractPage.content.filter((contract) => contract.status === "COMPLETED"));
      setJobRoleLabels(Object.fromEntries(jobRoles.map((item) => [item.code, item.label])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로젝트 완료 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, role]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadSummary();
    });
    return () => {
      cancelled = true;
    };
  }, [loadSummary]);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">완료 정보를 불러오고 있습니다.</div>;

  if (role === "client" && !project) {
    return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "완료된 프로젝트를 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadSummary()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;
  }

  if (!project) {
    return <main className="flex min-h-[60vh] items-center justify-center text-sm text-theme-muted">완료 정보를 준비하고 있습니다.</main>;
  }

  const deposit = settlements.find((settlement) => settlement.phase === "DEPOSIT");
  const successFee = settlements.find((settlement) => settlement.phase === "SUCCESS_FEE");
  const periodLabel = `${project.periodValue}${PERIOD_UNIT_LABEL[project.periodUnit] ?? project.periodUnit}`;

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-surface-subtle px-5 py-8 text-theme-primary">
      <div className="mx-auto w-full max-w-[680px]">
        <header className="text-center">
          <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-theme-success">프로젝트가 완료되었습니다.</h1>
          <p className="mt-3 text-[12px] font-semibold text-theme-secondary">모든 정산이 완료되었습니다.</p>
        </header>

        {errorMessage ? <p role="alert" className="mt-5 rounded-[10px] border border-theme bg-danger-surface px-4 py-3 text-[12px] text-theme-danger">{errorMessage}</p> : null}

        <section className="mt-7 rounded-xl border border-theme bg-surface px-6 py-6">
          <h2 className="text-[13px] font-bold">프로젝트 요약</h2>
          <dl className="mt-4 space-y-3 text-[11px]">
            <SummaryRow label="등록일" value={formatDate(project.createdAt)} />
            <SummaryRow label="시작일" value={formatDate(project.startDesiredDate)} />
            <SummaryRow label="실제 기간" value={periodLabel} />
            <SummaryRow label="계약 인원" value={`${project.confirmedHeadcount}명`} />
            <SummaryRow label="프로젝트 예산" value={formatAmount(project.budgetAmount)} />
          </dl>
        </section>

        <section className="mt-4 rounded-xl border border-theme bg-surface px-6 py-6">
          <h2 className="text-[13px] font-bold">플랫폼 수수료</h2>
          <dl className="mt-4 space-y-3 text-[11px]">
            <SummaryRow label="착수금 수수료" value={deposit ? formatAmount(deposit.feeAmount) : "-"} />
            <SummaryRow label="성공보수 수수료" value={successFee ? formatAmount(successFee.feeAmount) : "-"} />
          </dl>
        </section>

        <section className="mt-4 rounded-xl border border-theme bg-surface px-6 py-6">
          <h2 className="text-[13px] font-bold">계약 프리랜서</h2>
          {contracts.length === 0 ? <p className="py-8 text-center text-[11px] text-theme-muted">완료된 계약이 없습니다.</p> : <div className="mt-4 space-y-3">{contracts.map((contract) => <article key={contract.contractId} className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-theme px-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">{contract.counterpartName.slice(0, 1)}</span><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate text-[12px] font-bold">{contract.counterpartName}</h3><span className="rounded-full bg-success-surface px-2 py-0.5 text-[9px] font-bold text-theme-success">종료</span></div><p className="mt-1 text-[10px] text-theme-secondary">{jobRoleLabels[contract.jobRole] ?? contract.jobRole} · 월 {contract.payAmount.toLocaleString("ko-KR")}원</p></div></div></article>)}</div>}
        </section>

      </div>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-5 border-b border-theme py-2 last:border-b-0"><dt className="font-semibold text-theme-muted">{label}</dt><dd className="text-right font-bold text-theme-primary">{value}</dd></div>;
}
