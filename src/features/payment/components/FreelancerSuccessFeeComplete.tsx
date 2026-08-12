"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getMySettlements } from "@/features/payment/services/settlementPayment";
import type { SettlementResponse } from "@/features/payment/types/payment";

export function FreelancerSuccessFeeComplete() {
  const params = useParams<{ contractId: string }>();
  const searchParams = useSearchParams();
  const projectId = Number(searchParams.get("projectId"));
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSettlements = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setErrorMessage("프로젝트 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const page = await getMySettlements(projectId, 0, 10);
      setSettlements(page.content);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "정산 완료 정보를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadSettlements(); });
    return () => { cancelled = true; };
  }, [loadSettlements]);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">정산 완료 정보를 불러오고 있습니다.</div>;

  const deposit = settlements.find((settlement) => settlement.phase === "DEPOSIT");
  const successFee = settlements.find((settlement) => settlement.phase === "SUCCESS_FEE");

  if (errorMessage || !deposit || !successFee) {
    return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p role="alert" className="text-sm text-theme-danger">{errorMessage || "완료된 착수·성공보수 정산 내역을 확인할 수 없습니다."}</p><button type="button" onClick={() => void loadSettlements()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;
  }

  const baseAmount = deposit.baseAmount ?? successFee.baseAmount;
  const totalFee = deposit.feeAmount + successFee.feeAmount;

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-surface-subtle px-5 py-10 text-theme-primary">
      <section className="mx-auto w-full max-w-[620px] rounded-[18px] border border-theme bg-surface px-8 py-9 shadow-[0_4px_14px_rgba(15,23,42,0.05)] sm:px-10">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[#a7efc4] bg-[#dcfae6] text-[30px] font-bold text-theme-success">✓</div>
        <h1 className="mt-6 text-center text-[22px] font-extrabold">성공보수 수수료 결제가 완료되었습니다</h1>
        <p className="mt-3 text-center text-[12px] font-semibold text-theme-secondary">내 플랫폼 수수료 정산 내역입니다.</p>

        <dl className="mt-7 space-y-1 rounded-[12px] bg-surface-subtle px-5 py-5 text-[12px]">
          <SummaryRow label="계약 금액" value={formatAmount(baseAmount)} />
          <SummaryRow label={`착수 수수료 (${formatEffectiveRate(deposit)})`} value={formatAmount(deposit.feeAmount)} />
          <SummaryRow label={`성공보수 수수료 (${formatEffectiveRate(successFee)})`} value={formatAmount(successFee.feeAmount)} />
          <SummaryRow label="전체 플랫폼 수수료" value={formatAmount(totalFee)} emphasis />
          <SummaryRow label="착수 수수료 결제일" value={formatDate(deposit.paidAt)} />
          <SummaryRow label="성공보수 결제일" value={formatDate(successFee.paidAt)} />
        </dl>

        <div className="mt-7 flex justify-center gap-3">
          <Link href="/freelancer/contracts" className="flex h-12 items-center rounded-[9px] border border-theme px-6 text-[13px] font-semibold text-theme-secondary hover:bg-surface-subtle">내 계약</Link>
          <Link href={`/freelancer/contracts/${params.contractId}`} className="flex h-12 items-center rounded-[9px] bg-brand px-7 text-[13px] font-bold text-white hover:bg-brand-hover">계약 상세</Link>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className="flex items-center justify-between gap-5 border-b border-theme py-3 last:border-b-0"><dt className="font-semibold text-theme-muted">{label}</dt><dd className={`text-right font-bold ${emphasis ? "text-[15px] text-brand" : "text-theme-primary"}`}>{value}</dd></div>;
}

function formatEffectiveRate(settlement: SettlementResponse) {
  const feeRate = Number(settlement.feeRate);
  const discount = Number(settlement.gradeDiscount);
  const effectiveRate = feeRate - discount;
  const rate = Number.isInteger(effectiveRate) ? String(effectiveRate) : String(Number(effectiveRate.toFixed(2)));
  return discount > 0 ? `${rate}%, 할인 ${formatRate(discount)}%p 적용` : `${rate}%`;
}

const formatRate = (value: number) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
const formatAmount = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const formatDate = (value?: string | null) => value ? value.slice(0, 10).replaceAll("-", ".") : "-";
