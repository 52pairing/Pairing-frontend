"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getClientProjectContracts } from "@/features/client/myprojects/contract/services/contracts";
import type {
  ClientContractListItem,
  ClientContractPage,
} from "@/features/client/myprojects/contract/types/contract";
import { getProjectJobRoles } from "@/features/client/projects/services/projectPreReview";

const formatAmount = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;
const formatDate = (date: string) => date.replaceAll("-", ".");

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
        <article key={contract.contractId} className="flex min-h-[128px] items-start justify-between gap-6 rounded-[14px] border border-theme bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="break-words text-[15px] font-bold text-theme-primary">{contract.projectTitle}</h2>
              <ContractStatusBadge contract={contract} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold">
              <span className="text-theme-secondary">{contract.counterpartName} · {jobRoleLabels[contract.jobRole] ?? contract.jobRole}</span>
              <span className="text-theme-secondary">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
              <span className="text-theme-primary">월 {formatAmount(contract.payAmount)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold">
              <SignatureStatus label="클라이언트 서명" signed={contract.clientSigned} />
              <SignatureStatus label="프리랜서 서명" signed={contract.freelancerSigned} />
              <span className="text-theme-muted">{contract.contractNo}</span>
            </div>
          </div>
          {contract.status === "DRAFT" ? (
            <span aria-disabled="true" className="flex h-[36px] shrink-0 cursor-not-allowed items-center rounded-[8px] bg-surface-muted px-4 text-[12px] font-bold text-theme-muted">계약 상세보기</span>
          ) : (
            <Link href={`/client/projects/${projectId}/contracts/${contract.contractId}`} className="flex h-[36px] shrink-0 items-center rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover">계약 상세보기</Link>
          )}
        </article>
      ))}
    </section>
  );
}

function ContractStatusBadge({ contract }: { contract: ClientContractListItem }) {
  const label = getContractStatusLabel(contract);
  return <span className="rounded-full border border-theme bg-surface-subtle px-2.5 py-1 text-[11px] font-semibold text-theme-secondary">{label}</span>;
}

function getContractStatusLabel(contract: ClientContractListItem) {
  if (contract.status === "DRAFT") return "계약서 준비 중";
  if (contract.signatureRequired) return "내 서명 대기";
  if (contract.status === "SIGN_PENDING") return "상대방 서명 대기";
  if (contract.status === "SIGNED" && !contract.depositPaid) return "프리랜서 결제 대기";
  if (contract.status === "SIGNED") return "계약 완료";
  if (contract.status === "IN_PROGRESS") return "진행 중";
  if (contract.status === "COMPLETION_PENDING") return "정산 대기";
  if (contract.status === "COMPLETED") return "완료";
  return contract.status;
}

function SignatureStatus({ label, signed }: { label: string; signed: boolean }) {
  return <span className={signed ? "text-theme-success" : "text-theme-warning"}>{signed ? "✓" : "○"} {label}</span>;
}
