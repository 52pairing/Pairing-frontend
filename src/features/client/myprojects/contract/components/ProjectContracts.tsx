const CONTRACTS = [
  {
    id: 1,
    title: "B2B 주문 관리 서비스 리뉴얼",
    status: "프리랜서 서명 대기",
    freelancer: "김개발",
    role: "프론트엔드",
    period: "2026.09.01 - 2026.12.31",
    monthlyPay: "월 6,200,000원",
    clientSigned: true,
    freelancerSigned: false,
  },
  {
    id: 2,
    title: "B2B 주문 관리 서비스 리뉴얼",
    status: "계약 완료",
    freelancer: "박서버",
    role: "백엔드",
    period: "2026.09.01 - 2026.12.31",
    monthlyPay: "월 5,800,000원",
    clientSigned: true,
    freelancerSigned: true,
  },
  {
    id: 3,
    title: "B2B 주문 관리 서비스 리뉴얼",
    status: "결제 필요",
    freelancer: "박서버",
    role: "백엔드",
    period: "2026.09.01 - 2026.12.31",
    monthlyPay: "월 5,800,000원",
    clientSigned: true,
    freelancerSigned: true,
  },
] as const;

/** 프로젝트 상세의 계약 탭에 표시되는 하드코딩 계약 목록입니다. */
export function ProjectContracts({ projectId = "1" }: { projectId?: string }) {
  return (
    <section className="mt-6 space-y-3">
      {CONTRACTS.map((contract) => (
        <article
          key={contract.id}
          className="flex min-h-[128px] items-start justify-between rounded-[14px] border border-theme bg-surface px-6 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)]"
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-bold text-theme-primary">
                {contract.title}
              </h2>
              <ContractStatusBadge status={contract.status} />
            </div>

            <div className="mt-3 flex items-center gap-6 text-[12px] font-semibold">
              <span className="text-theme-secondary">
                {contract.freelancer} · {contract.role}
              </span>
              <span className="text-theme-secondary">{contract.period}</span>
              <span className="text-theme-primary">{contract.monthlyPay}</span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold">
              <SignatureStatus
                label="클라이언트 서명"
                signed={contract.clientSigned}
              />
              <SignatureStatus
                label="프리랜서 서명"
                signed={contract.freelancerSigned}
              />
            </div>
          </div>

          <Link
            href={`/client/projects/${projectId}/contracts/${contract.id}`}
            className="h-[36px] cursor-pointer rounded-[8px] bg-brand px-4 text-[12px] font-bold text-white transition hover:bg-brand"
          >
            <span className="flex h-full items-center">계약 상세보기</span>
          </Link>
        </article>
      ))}
    </section>
  );
}

function ContractStatusBadge({ status }: { status: string }) {
  const isWaiting = status === "프리랜서 서명 대기";
  const isPaymentRequired = status === "결제 필요";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        isWaiting
          ? "border-[#cad3df] bg-[#f7f9fb] text-[#526174]"
          : isPaymentRequired
            ? "border-[#f5d9a6] bg-[#fff8e9] text-[#d97706]"
            : "border-[#b8e7cd] bg-[#effcf4] text-theme-success"
      }`}
    >
      {status}
    </span>
  );
}

function SignatureStatus({
  label,
  signed,
}: {
  label: string;
  signed: boolean;
}) {
  return (
    <span className={signed ? "text-theme-success" : "text-[#ff9500]"}>
      {signed ? "✓" : "○"} {label}
    </span>
  );
}
import Link from "next/link";
