import Link from "next/link";

import type { SettlementResponse } from "@/features/payment/types/payment";

interface SettlementPaymentCompleteProps {
  settlement: SettlementResponse;
  contractId: number;
}

const STATUS_LABELS = {
  DEPOSIT: "착수 수수료 결제 완료",
  SUCCESS_FEE: "성공보수 수수료 결제 완료",
} as const;

export function SettlementPaymentComplete({
  settlement,
  contractId,
}: SettlementPaymentCompleteProps) {
  const statusLabel = settlement.status === "PAID"
    ? STATUS_LABELS[settlement.phase]
    : `${settlement.phase} · ${settlement.status}`;

  return (
    <main className="flex min-h-[calc(100dvh-60px)] items-center justify-center bg-surface-subtle px-5 py-10 text-theme-primary">
      <section className="w-full max-w-[560px] rounded-[18px] border border-theme bg-surface px-8 py-10 shadow-[0_4px_14px_rgba(15,23,42,0.05)] sm:px-10">
        <span className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-full border border-[#a7efc4] bg-[#dcfae6]">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
            <path d="M12 21L18 27L30 15" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <h1 className="mt-7 text-center text-[24px] font-extrabold tracking-[-0.04em]">결제가 완료되었습니다</h1>
        <p className="mt-3 text-center text-[14px] font-bold text-theme-success">{statusLabel}</p>

        <dl className="mt-7 space-y-4 border-y border-theme py-6 text-[13px]">
          <CompleteRow label="프로젝트명" value={settlement.projectTitle} />
          <CompleteRow label="결제 금액" value={`${settlement.feeAmount.toLocaleString("ko-KR")}원`} />
          {settlement.paymentMethodLabel ? <CompleteRow label="결제수단" value={settlement.paymentMethodLabel} /> : null}
          <CompleteRow label="결제일시" value={settlement.paidAt ? formatDateTime(settlement.paidAt) : "-"} />
          <CompleteRow label="결제 승인번호" value={settlement.approvalNo ?? "-"} />
          <CompleteRow label="결제 상태" value={statusLabel} />
        </dl>

        <div className="mt-7 flex items-center justify-center gap-3">
          <Link href="/freelancer" className="flex h-[52px] items-center justify-center rounded-[10px] border border-theme bg-surface px-7 text-[14px] font-semibold text-theme-secondary transition hover:bg-surface-subtle">홈으로</Link>
          <Link href={`/freelancer/contracts/${contractId}`} className="flex h-[52px] items-center justify-center rounded-[10px] bg-brand px-8 text-[14px] font-bold text-white transition hover:bg-brand-hover">계약 상세로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}

function CompleteRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-6"><dt className="shrink-0 font-semibold text-theme-muted">{label}</dt><dd className="text-right font-bold text-theme-primary">{value}</dd></div>;
}

const formatDateTime = (value: string) => value.replace("T", " ").slice(0, 16).replaceAll("-", ".");
