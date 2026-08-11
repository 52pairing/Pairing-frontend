"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useProjectRegister } from "@/features/client/projects/context/ProjectRegisterContext";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";
import type { SettlementResponse } from "@/features/payment/types/payment";

const PERIOD_UNIT_LABEL: Record<string, string> = {
  DAY: "일",
  WEEK: "주",
  MONTH: "개월",
  YEAR: "년",
};

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: "등록 완료",
};

function formatKoreanDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export function ProjectRegisterComplete() {
  const router = useRouter();
  const {
    form,
    registeredProject,
    clearDraft,
    clearRegisteredProject,
  } = useProjectRegister();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!registeredProject) router.replace("/client/projects");
  }, [registeredProject, router]);

  if (!registeredProject) return null;

  const jobRoleLabelByCode = new Map(
    (form.recruits ?? []).map((recruit) => [
      recruit.job,
      recruit.jobLabel ?? recruit.job,
    ]),
  );
  const positions = registeredProject.positions
    .map((position) => {
      const jobRoleCode =
        typeof position.jobRole === "string"
          ? position.jobRole
          : position.jobRole.code;
      const jobRoleLabel =
        position.jobRoleLabel ??
        position.jobRoleName ??
        position.label ??
        (typeof position.jobRole === "object"
          ? position.jobRole.label
          : undefined) ??
        jobRoleLabelByCode.get(position.code ?? jobRoleCode) ??
        jobRoleCode;

      return `${jobRoleLabel} ${position.headcount}명`;
    })
    .join(", ");
  const period = `${registeredProject.periodValue}${PERIOD_UNIT_LABEL[registeredProject.periodUnit] ?? registeredProject.periodUnit}`;
  const upfrontFee = Math.round(registeredProject.budgetAmount * 0.03);

  const leaveCompletePage = (path: string) => {
    clearDraft();
    clearRegisteredProject();
    router.push(path);
  };

  const completePayment = async (paidSettlement?: SettlementResponse) => {
    if (!paidSettlement) return;
    leaveCompletePage(
      `/client/payments/complete?projectId=${paidSettlement.projectId}`,
    );
  };

  return (
    <main className="min-h-[calc(100dvh-60px)] bg-surface-subtle text-theme-primary">
      <div className="mx-auto w-full max-w-[980px] px-6 py-4">
        <div className="mx-auto mt-10 max-w-[720px] text-center">
          <h1 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em]">프로젝트 등록 완료!</h1>
          <p className="mt-3 text-[13px] font-medium leading-6 text-theme-secondary">
            <span className="font-bold text-theme-primary">{registeredProject.title}</span> 프로젝트가 등록되었습니다.
            <br />AI 추천을 시작하려면 착수금 결제가 필요합니다.
          </p>

          <section className="mt-8 rounded-[14px] border border-theme bg-surface px-8 py-7 text-left">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <SummaryItem label="프로젝트명" value={registeredProject.title} />
              <SummaryItem label="모집 포지션" value={positions || "-"} />
              <SummaryItem label="프로젝트 기간" value={period} />
              <SummaryItem label="예산" value={`${registeredProject.budgetAmount.toLocaleString("ko-KR")}원`} />
              <SummaryItem label="시작 희망일" value={formatKoreanDate(registeredProject.startDesiredDate)} />
              <SummaryItem
                label="현재 상태"
                value={<span className="inline-flex rounded-[6px] bg-[#eee9ff] px-2 py-[3px] text-[11px] font-bold text-[#6b4eff]">{STATUS_LABEL[registeredProject.status] ?? registeredProject.status}</span>}
              />
            </div>
          </section>

          <div className="mt-4 rounded-[10px] border border-[#f4d367] bg-[#fffbed] px-4 py-3 text-left text-[11px] font-bold leading-5 text-[#b45309]">
            착수금 결제 전에는 AI 추천 후보 메뉴를 이용할 수 없습니다. 결제 후 추천 후보를 확인할 수 있습니다.
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <ActionButton onClick={() => leaveCompletePage("/client/projects")}>내 프로젝트로 이동</ActionButton>
            <ActionButton onClick={() => leaveCompletePage(`/client/projects/${registeredProject.projectId}`)}>프로젝트 상세보기</ActionButton>
            {registeredProject.payableSettlementId != null ? (
              <button type="button" onClick={() => setIsPaymentModalOpen(true)} className="flex h-[46px] items-center justify-center rounded-[9px] bg-brand px-6 text-[12px] font-bold text-white hover:bg-brand">착수금 결제하기</button>
            ) : null}
          </div>
        </div>
      </div>

      <PaymentMethodModal
        open={isPaymentModalOpen}
        payment={{
          settlementId: registeredProject.payableSettlementId ?? undefined,
          type: "UPFRONT_FEE",
          title: "착수금 수수료",
          description: registeredProject.title,
          amount: upfrontFee,
        }}
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={completePayment}
      />
    </main>
  );
}

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex h-[46px] items-center justify-center rounded-[9px] border border-[#c3ccd8] bg-surface px-6 text-[12px] font-bold text-theme-secondary hover:bg-surface-subtle">{children}</button>;
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-[12px] font-medium text-theme-muted">{label}</p><div className="mt-1.5 text-[13px] font-bold text-theme-primary">{value}</div></div>;
}
