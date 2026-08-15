import Link from "next/link";

import type { ContractListItem } from "@/features/contract/types/contractList";
import { formatContractDate, formatMonthlyAmount } from "@/features/contract/utils/format";

export type ContractAction = "sign" | "upfrontFee" | "successFee" | "review" | "none";
type BadgeTone = "orange" | "blue" | "green" | "purple" | "red";

export interface FreelancerContractCardProps {
  contract: ContractListItem;
  onAction?: () => void;
}

export function FreelancerContractCard({ contract, onAction }: FreelancerContractCardProps) {
  const presentation = getContractPresentation(contract);

  return (
    <article className="rounded-xl border border-theme bg-surface px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[14px] font-bold tracking-[-0.35px] text-theme-primary">
              {contract.projectTitle}
            </h2>
            <StatusBadge label={presentation.label} tone={presentation.tone} />
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-theme-secondary">
            {contract.counterpartName} · {contract.clientBusinessField || "-"}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          {contract.status === "DRAFT" ? (
            <span aria-disabled="true" className={disabledButtonClass}>계약 상세</span>
          ) : (
            <Link href={`/freelancer/contracts/${contract.contractId}`} className={secondaryButtonClass}>계약 상세</Link>
          )}
          {presentation.action !== "none" ? (
            presentation.action === "sign" ? (
              <Link href={`/freelancer/contracts/${contract.contractId}/sign`} className={primaryButtonClass}>
                {ACTION_LABELS[presentation.action]}
              </Link>
            ) : (
              <button type="button" onClick={onAction} className={primaryButtonClass}>
                {ACTION_LABELS[presentation.action]}
              </button>
            )
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 text-[11px] sm:grid-cols-4">
        <ContractInfo label="계약 금액" value={formatMonthlyAmount(contract.payAmount)} />
        <ContractInfo label="계약 기간" value={`${formatContractDate(contract.startDate)} ~ ${formatContractDate(contract.endDate)}`} />
        <ContractInfo label="계약서 생성일" value={formatContractDate(contract.createdAt)} />
        <ContractInfo label="근무" value={contract.workStyle ? WORK_STYLE_LABELS[contract.workStyle] : "-"} />
      </dl>

      <p className={`mt-4 inline-flex rounded-md border px-3 py-2 text-[10px] font-semibold ${NOTICE_COLORS[presentation.tone]}`}>
        {presentation.notice}
      </p>
    </article>
  );
}

export function getContractAction(contract: ContractListItem): ContractAction {
  if (contract.status === "SIGN_PENDING" && contract.signatureRequired) return "sign";
  if (contract.status === "SIGNED" && !contract.depositPaid) return "upfrontFee";
  if (contract.status === "COMPLETION_PENDING") return "successFee";
  if (contract.status === "COMPLETED") return "review";
  return "none";
}

function getContractPresentation(contract: ContractListItem) {
  const action = getContractAction(contract);

  if (contract.status === "DRAFT") return { label: "작성 중", tone: "orange" as const, notice: "AI가 계약 문구를 작성하고 있습니다.", action };
  if (contract.status === "SIGN_PENDING") return { label: "서명 대기", tone: "orange" as const, notice: contract.signatureRequired ? "계약서를 확인하고 서명을 진행해 주세요." : "상대방의 서명을 기다리고 있습니다.", action };
  if (contract.status === "SIGNED") return { label: "계약 체결 완료", tone: "blue" as const, notice: contract.depositPaid ? "계약 체결이 완료되었습니다." : "착수금 수수료를 결제하면 프로젝트가 시작됩니다.", action };
  if (contract.status === "IN_PROGRESS") return { label: "진행 중", tone: "blue" as const, notice: "계약에 따라 프로젝트가 진행 중입니다.", action };
  if (contract.status === "COMPLETION_PENDING") return { label: "정산 대기", tone: "purple" as const, notice: "검수가 완료되었습니다. 성공보수 수수료를 결제해 주세요.", action };
  if (contract.status === "COMPLETED") return { label: "완료", tone: "green" as const, notice: "프로젝트와 계약 정산이 완료되었습니다.", action };
  if (contract.status === "TERMINATED") return { label: "중도 종료", tone: "red" as const, notice: "계약이 정상 완료 전에 종료되었습니다.", action };
  if (contract.status === "REJECTED") return { label: "계약 거절", tone: "red" as const, notice: "계약이 거절되었습니다.", action };
  return { label: contract.status, tone: "red" as const, notice: "계약 상태를 확인해 주세요.", action };
}

const WORK_STYLE_LABELS: Record<NonNullable<ContractListItem["workStyle"]>, string> = {
  REMOTE: "재택",
  ONSITE: "상주",
  ANY: "모두 가능",
};

const ACTION_LABELS: Record<Exclude<ContractAction, "none">, string> = {
  sign: "계약서 확인 및 서명",
  upfrontFee: "착수금 수수료 결제",
  successFee: "성공보수 수수료 결제",
  review: "리뷰 작성",
};

// 상태 구분용 고정 색상(다크모드 가이드 §5 허용). 배경이 고정 밝은 톤이라
// 글자도 고정값으로 통일해 다크 배경에서도 밝은 칩 위 글자가 읽히도록 유지한다.
const BADGE_COLORS: Record<BadgeTone, string> = {
  orange: "border-[#f4d49e] bg-[#fff8e9] text-[#e48100]",
  blue: "border-[#bdd9ef] bg-[#eef7fc] text-[#2386bc]",
  green: "border-[#bde9ce] bg-[#effcf4] text-[#067647]",
  purple: "border-[#d9c8ff] bg-[#f7f1ff] text-[#7c3aed]",
  red: "border-[#ffc9c5] bg-[#fff2f1] text-[#b42318]",
};

const NOTICE_COLORS: Record<BadgeTone, string> = {
  orange: "border-[#f2ddba] bg-[#fff9ec] text-[#e48100]",
  blue: "border-[#cbdcf1] bg-[#eef6fc] text-[#3478f6]",
  green: "border-[#bee8cd] bg-[#effcf4] text-[#067647]",
  purple: "border-[#d9c8ff] bg-[#f7f1ff] text-[#7c3aed]",
  red: "border-[#ffc9c5] bg-[#fff2f1] text-[#b42318]",
};

const secondaryButtonClass = "flex h-[31px] cursor-pointer items-center rounded-[7px] border border-theme bg-surface px-3.5 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle";
const primaryButtonClass = "flex h-[31px] cursor-pointer items-center rounded-[7px] bg-brand px-3.5 text-[11px] font-bold text-white transition hover:bg-brand-hover";
const disabledButtonClass = "flex h-[31px] cursor-not-allowed items-center rounded-[7px] bg-surface-muted px-3.5 text-[11px] font-semibold text-theme-muted";

function StatusBadge({ label, tone }: { label: string; tone: BadgeTone }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${BADGE_COLORS[tone]}`}>{label}</span>;
}

function ContractInfo({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-theme-muted">{label}</dt><dd className="mt-1.5 font-bold text-theme-primary">{value}</dd></div>;
}
