import Link from "next/link";

import type { ClientContractCardProps, ClientContractListItem } from "@/features/contract/types/clientContract";
import { formatContractDate, formatKrw } from "@/features/contract/utils/format";

export function ClientContractCard({ contract, jobRoleLabel, detailHref }: ClientContractCardProps) {
  return (
    <article className="flex min-h-[128px] items-start justify-between gap-6 rounded-[14px] border border-theme bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="break-words text-[15px] font-bold text-theme-primary">{contract.projectTitle}</h2>
          <ContractStatusBadge contract={contract} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold">
          <span className="text-theme-secondary">{contract.counterpartName} · {jobRoleLabel}</span>
          <span className="text-theme-secondary">{formatContractDate(contract.startDate)} - {formatContractDate(contract.endDate)}</span>
          <span className="text-theme-primary">월 {formatKrw(contract.payAmount)}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <SignatureStatus label="클라이언트 서명" signed={contract.clientSigned} />
          <SignatureStatus label="프리랜서 서명" signed={contract.freelancerSigned} />
          <span className="text-theme-muted">{contract.contractNo}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {contract.status === "COMPLETED" ? (
          <Link href={`/client/projects/${contract.projectId}/review?contractId=${contract.contractId}`} className="flex h-[36px] items-center rounded-[8px] border border-brand px-4 text-[12px] font-bold text-brand transition hover:bg-surface-subtle">리뷰 작성</Link>
        ) : null}
        {contract.status === "DRAFT" ? (
          <span aria-disabled="true" className="flex h-[36px] cursor-not-allowed items-center rounded-[8px] bg-surface-muted px-4 text-[12px] font-bold text-theme-muted">계약 상세보기</span>
        ) : (
          <Link href={detailHref} className="flex h-[36px] items-center rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand-hover">계약 상세보기</Link>
        )}
      </div>
    </article>
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
