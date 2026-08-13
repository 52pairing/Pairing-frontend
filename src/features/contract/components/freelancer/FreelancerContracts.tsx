"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getContracts, getContractTabCounts } from "@/features/contract/services/contracts";
import type { ContractListItem, ContractListPage, ContractListTab } from "@/features/contract/types/contractList";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";
import { SettlementPaymentComplete } from "@/features/payment/components/SettlementPaymentComplete";
import { getMySettlements } from "@/features/payment/services/settlementPayment";
import type { SettlementResponse } from "@/features/payment/types/payment";

import { FreelancerContractCard, getContractAction } from "./FreelancerContractCard";
import { FreelancerContractStatusTabs, type FreelancerContractStatus } from "./FreelancerContractStatusTabs";

const TAB_CODES: Record<FreelancerContractStatus, ContractListTab> = {
  전체: "ALL",
  "서명 대기": "AWAITING_ME",
  "진행 중": "IN_PROGRESS",
  "정산 대기": "SETTLEMENT_PENDING",
  완료: "COMPLETED",
};

const PAGE_SIZE = 10;

export function FreelancerContracts() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<FreelancerContractStatus>("전체");
  const [page, setPage] = useState(0);
  const [contractPage, setContractPage] = useState<ContractListPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");
  const [paymentContract, setPaymentContract] = useState<ContractListItem | null>(null);
  const [successFeeContract, setSuccessFeeContract] = useState<ContractListItem | null>(null);
  const [completedPayment, setCompletedPayment] = useState<{ settlement: SettlementResponse; contractId: number } | null>(null);
  const requestIdRef = useRef(0);
  const [tabRows, setTabRows] = useState<Partial<Record<FreelancerContractStatus, { label: string; count: number }>>>({});

  const loadTabCounts = useCallback(async () => {
    try {
      const rows = await getContractTabCounts();
      const byTab = Object.fromEntries(rows.map((row) => [row.tab, row]));
      setTabRows(Object.fromEntries(Object.entries(TAB_CODES).map(([label, code]) => [label, byTab[code] ? { label: byTab[code].label, count: byTab[code].count } : undefined])));
    } catch {
      setTabRows({});
    }
  }, []);

  const loadContracts = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const contracts = await getContracts({ tab: TAB_CODES[activeStatus], page, size: PAGE_SIZE });
      if (requestId === requestIdRef.current) setContractPage(contracts);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setErrorMessage(error instanceof Error ? error.message : "계약 목록을 불러오지 못했습니다.");
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [activeStatus, page]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (!cancelled) await loadContracts();
    });
    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [loadContracts]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadTabCounts(); });
    return () => { cancelled = true; };
  }, [loadTabCounts]);

  const changeStatus = (status: FreelancerContractStatus) => {
    setActiveStatus(status);
    setPage(0);
  };

  const handleAction = async (contract: ContractListItem) => {
    const action = getContractAction(contract);
    if (action === "upfrontFee") {
      let settlementId = contract.payableSettlementId;

      if (settlementId == null) {
        try {
          setPaymentErrorMessage("");
          const settlements = await getMySettlements(contract.projectId, 0, 10);
          const payableDeposit = settlements.content.find(
            (settlement) => settlement.phase === "DEPOSIT" && settlement.payable,
          );
          settlementId = payableDeposit?.settlementId ?? null;
        } catch (error) {
          setPaymentErrorMessage(error instanceof Error ? error.message : "결제 정보를 불러오지 못했습니다.");
          return;
        }
      }

      if (settlementId == null) {
        setPaymentErrorMessage("결제 가능한 착수금 정산 내역이 없습니다.");
        return;
      }

      setPaymentErrorMessage("");
      setPaymentContract({ ...contract, payableSettlementId: settlementId });
    }
    if (action === "successFee") {
      if (contract.payableSettlementId == null) return;
      setSuccessFeeContract(contract);
    }
  };

  const contracts = contractPage?.content ?? [];

  if (completedPayment) {
    return <SettlementPaymentComplete settlement={completedPayment.settlement} contractId={completedPayment.contractId} />;
  }

  return (
    <main className="min-h-screen bg-surface-subtle pb-8">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 sm:px-5">
        <h1 className="text-[20px] font-bold tracking-[-0.6px] text-theme-primary">내 계약</h1>
        <p className="mt-2 text-[11px] font-semibold text-[#748094]">계약 체결 이후 진행 상황을 확인하세요.</p>

        <FreelancerContractStatusTabs activeStatus={activeStatus} onStatusChange={changeStatus} rows={tabRows} />

        {paymentErrorMessage ? <p role="alert" className="mt-4 rounded-lg border border-[#fda29b] bg-danger-surface px-4 py-3 text-[11px] font-semibold text-theme-danger">{paymentErrorMessage}</p> : null}

        {errorMessage ? (
          <div role="alert" className="mt-5 flex h-32 flex-col items-center justify-center gap-3 rounded-xl border border-[#fda29b] bg-surface text-[12px] text-theme-danger">
            <p>{errorMessage}</p>
            <button type="button" onClick={() => void loadContracts()} className="rounded-[8px] border border-[#b42318] px-4 py-2 font-bold">다시 시도</button>
          </div>
        ) : isLoading ? (
          <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-theme bg-surface text-[12px] text-theme-secondary">계약 목록을 불러오고 있습니다.</div>
        ) : contracts.length ? (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {contracts.map((contract) => <FreelancerContractCard key={contract.contractId} contract={contract} onAction={() => void handleAction(contract)} />)}
            </div>
            {contractPage && contractPage.totalPages > 1 ? (
              <nav aria-label="계약 목록 페이지" className="mt-6 flex items-center justify-center gap-3">
                <button type="button" disabled={contractPage.first || isLoading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-theme bg-surface px-4 py-2 text-[11px] font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:text-theme-muted">이전</button>
                <span className="text-[11px] font-semibold text-theme-secondary">{contractPage.page + 1} / {contractPage.totalPages}</span>
                <button type="button" disabled={contractPage.last || isLoading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-theme bg-surface px-4 py-2 text-[11px] font-semibold text-theme-secondary disabled:cursor-not-allowed disabled:text-theme-muted">다음</button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-theme bg-surface text-[12px] text-theme-muted">해당 상태의 계약이 없습니다.</div>
        )}
      </div>

      <PaymentMethodModal open={paymentContract !== null} payment={{ settlementId: paymentContract?.payableSettlementId ?? undefined, type: "UPFRONT_FEE", title: "착수금 수수료", description: paymentContract?.projectTitle ?? "프로젝트", amount: 0 }} onClose={() => setPaymentContract(null)} onPay={(settlement) => { const contractId = paymentContract?.contractId; setPaymentContract(null); if (settlement && contractId != null) setCompletedPayment({ settlement, contractId }); }} />
      <PaymentMethodModal open={successFeeContract !== null} payment={{ settlementId: successFeeContract?.payableSettlementId ?? undefined, type: "SUCCESS_FEE", title: "성공보수 수수료", description: successFeeContract?.projectTitle ?? "프로젝트", amount: 0, duration: successFeeContract ? getContractDuration(successFeeContract.startDate, successFeeContract.endDate) : undefined }} onClose={() => setSuccessFeeContract(null)} onPay={(settlement) => { const contract = successFeeContract; setSuccessFeeContract(null); if (settlement && contract) router.push(`/freelancer/contracts/${contract.contractId}/success-fee/complete?projectId=${contract.projectId}`); }} />
    </main>
  );
}

function getContractDuration(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} ~ ${endDate}`;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
  return `${Math.max(months, 1)}개월`;
}
