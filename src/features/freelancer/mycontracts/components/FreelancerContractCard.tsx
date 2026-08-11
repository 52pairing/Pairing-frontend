export type ContractFilterState = "서명 대기" | "진행 중" | "정산 대기" | "완료";
export type ContractAction = "sign" | "upfrontFee" | "detail" | "successFee" | "review" | "none";
export type BadgeTone = "orange" | "blue" | "green" | "purple" | "red";

interface ContractBadge {
  label: string;
  tone: BadgeTone;
}

export interface FreelancerContractCardProps {
  id: string;
  title: string;
  company: string;
  industry: string;
  filterState: ContractFilterState;
  badges: ContractBadge[];
  monthlyPay: string;
  period: string;
  createdAt: string;
  workType: string;
  notice: string;
  noticeTone: BadgeTone;
  action: ContractAction;
  onAction?: () => void;
}

export function FreelancerContractCard({
  id,
  title,
  company,
  industry,
  badges,
  monthlyPay,
  period,
  createdAt,
  workType,
  notice,
  noticeTone,
  action,
  onAction,
}: FreelancerContractCardProps) {
  return (
    <article className="rounded-xl border border-theme bg-surface px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[14px] font-bold tracking-[-0.35px] text-theme-primary">
              {title}
            </h2>
            {badges.map((badge) => (
              <StatusBadge key={badge.label} {...badge} />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-theme-secondary">
            {company} · {industry}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Link href={`/freelancer/contracts/${id}`} className={secondaryButtonClass}>계약 상세</Link>
          {action !== "none" ? (
            action === "sign" ? (
              <Link href={`/freelancer/contracts/${id}/sign`} className={primaryButtonClass}>
                {ACTION_LABELS[action]}
              </Link>
            ) : (
              <button type="button" onClick={onAction} className={primaryButtonClass}>
                {ACTION_LABELS[action]}
              </button>
            )
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 text-[11px] sm:grid-cols-4">
        <ContractInfo label="계약 금액" value={monthlyPay} />
        <ContractInfo label="계약 기간" value={period} />
        <ContractInfo label="계약서 생성일" value={createdAt} />
        <ContractInfo label="근무" value={workType} />
      </dl>

      <p className={`mt-4 inline-flex rounded-md border px-3 py-2 text-[10px] font-semibold ${NOTICE_COLORS[noticeTone]}`}>
        {notice}
      </p>
    </article>
  );
}

const ACTION_LABELS: Record<Exclude<ContractAction, "none">, string> = {
  sign: "계약서 확인 및 서명",
  upfrontFee: "착수금 수수료 결제",
  detail: "계약 상세보기",
  successFee: "성공보수 수수료 결제",
  review: "리뷰 작성",
};

const BADGE_COLORS: Record<BadgeTone, string> = {
  orange: "border-[#f4d49e] bg-[#fff8e9] text-[#e48100]",
  blue: "border-[#bdd9ef] bg-[#eef7fc] text-[#2386bc]",
  green: "border-[#bde9ce] bg-[#effcf4] text-theme-success",
  purple: "border-[#d9c8ff] bg-[#f7f1ff] text-[#7c3aed]",
  red: "border-[#ffc9c5] bg-[#fff2f1] text-theme-danger",
};

const NOTICE_COLORS: Record<BadgeTone, string> = {
  orange: "border-[#f2ddba] bg-[#fff9ec] text-[#e48100]",
  blue: "border-[#cbdcf1] bg-[#eef6fc] text-[#3478f6]",
  green: "border-[#bee8cd] bg-[#effcf4] text-theme-success",
  purple: "border-[#d9c8ff] bg-[#f7f1ff] text-[#7c3aed]",
  red: "border-[#ffc9c5] bg-[#fff2f1] text-theme-danger",
};

const secondaryButtonClass =
  "flex h-[31px] cursor-pointer items-center rounded-[7px] border border-[#dce2e9] bg-surface px-3.5 text-[11px] font-semibold text-theme-secondary transition hover:bg-surface-subtle";
const primaryButtonClass =
  "flex h-[31px] cursor-pointer items-center rounded-[7px] bg-brand px-3.5 text-[11px] font-bold text-white transition hover:bg-brand";

function StatusBadge({ label, tone }: ContractBadge) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${BADGE_COLORS[tone]}`}>
      {label}
    </span>
  );
}

function ContractInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-theme-muted">{label}</dt>
      <dd className="mt-1.5 font-bold text-theme-primary">{value}</dd>
    </div>
  );
}
import Link from "next/link";
