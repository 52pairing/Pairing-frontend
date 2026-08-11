"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getClientProjectContracts } from "@/features/client/myprojects/contract/services/contracts";
import type { ClientContractPage } from "@/features/client/myprojects/contract/types/contract";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "계약서 작성 중",
};

const PAY_UNIT_LABEL: Record<string, string> = {
  HOURLY: "시급",
};

const formatAmount = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;
const formatDate = (date: string) => date.replaceAll("-", ".");

export function ProjectContracts({ projectId }: { projectId: string }) {
  const parsedProjectId = Number(projectId);
  const [contractPage, setContractPage] = useState<ClientContractPage | null>(null);
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
      setContractPage(await getClientProjectContracts(parsedProjectId));
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
        <article key={contract.contractId} className="flex min-h-[128px] items-start justify-between gap-6 rounded-[14px] border border-theme bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="break-words text-[15px] font-bold text-theme-primary">{contract.projectTitle}</h2>
              <ContractStatusBadge status={contract.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold">
              <span className="text-theme-secondary">{contract.counterpartName}</span>
              <span className="text-theme-secondary">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
              <span className="text-theme-primary">총 {formatAmount(contract.totalAmount)}</span>
              <span className="text-theme-primary">{PAY_UNIT_LABEL[contract.payUnit] ?? contract.payUnit} {formatAmount(contract.payAmount)}</span>
            </div>
            <p className={`mt-3 text-[11px] font-semibold ${contract.signatureRequired ? "text-theme-warning" : "text-theme-success"}`}>
              {contract.signatureRequired ? "○ 내 서명 필요" : "✓ 내 서명 완료"} · {contract.contractNo}
            </p>
          </div>
          <Link href={`/client/projects/${projectId}/contracts/${contract.contractId}`} className="flex h-[36px] shrink-0 items-center rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover">계약 상세보기</Link>
        </article>
      ))}
    </section>
  );
}

function ContractStatusBadge({ status }: { status: string }) {
  return <span className="rounded-full border border-theme bg-surface-subtle px-2.5 py-1 text-[11px] font-semibold text-theme-secondary">{STATUS_LABEL[status] ?? status}</span>;
}
