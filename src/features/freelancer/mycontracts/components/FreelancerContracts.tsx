"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";
import { SuccessFeePaymentModal } from "@/features/payment/components/SuccessFeePaymentModal";

import {
  FreelancerContractCard,
  type FreelancerContractCardProps,
} from "./FreelancerContractCard";
import {
  FreelancerContractStatusTabs,
  type FreelancerContractStatus,
} from "./FreelancerContractStatusTabs";

const CONTRACTS: readonly FreelancerContractCardProps[] = [
  {
    id: "1",
    title: "B2B 주문 관리 서비스 리뉴얼",
    company: "주식회사 오이랩",
    industry: "IT/소프트웨어",
    filterState: "서명 대기",
    badges: [{ label: "서명 대기", tone: "orange" }],
    monthlyPay: "월 6,200,000원",
    period: "2026.09.01 ~ 2026.12.31",
    createdAt: "2026.08.03",
    workType: "재택",
    notice: "계약서를 확인하고 서명을 진행해 주세요.",
    noticeTone: "orange",
    action: "sign",
  },
  {
    id: "2",
    title: "핀테크 대시보드 개발",
    company: "파이낸스온",
    industry: "금융",
    filterState: "진행 중",
    badges: [
      { label: "계약 체결 완료", tone: "blue" },
      { label: "착수금 수수료 결제 대기", tone: "orange" },
    ],
    monthlyPay: "월 7,000,000원",
    period: "2026.10.01 ~ 2026.12.31",
    createdAt: "2026.09.28",
    workType: "재택",
    notice: "착수금 수수료를 결제하면 프로젝트가 시작됩니다.",
    noticeTone: "blue",
    action: "upfrontFee",
  },
  {
    id: "3",
    title: "AI 어드민 패널 구축",
    company: "딥랩",
    industry: "AI/ML",
    filterState: "진행 중",
    badges: [
      { label: "진행 중", tone: "blue" },
      { label: "착수금 수수료 결제 완료", tone: "green" },
    ],
    monthlyPay: "월 6,500,000원",
    period: "2026.05.01 ~ 2026.07.31",
    createdAt: "2026.04.25",
    workType: "재택",
    notice: "프로젝트 완료는 클라이언트가 처리합니다. 완료 및 검수가 끝나면 정산 대기로 자동 전환됩니다.",
    noticeTone: "blue",
    action: "detail",
  },
  {
    id: "4",
    title: "물류 플랫폼 대시보드",
    company: "로지테크리아",
    industry: "물류",
    filterState: "정산 대기",
    badges: [
      { label: "정산 대기", tone: "purple" },
      { label: "성공보수 수수료 결제 대기", tone: "purple" },
    ],
    monthlyPay: "월 6,000,000원",
    period: "2026.01.01 ~ 2026.03.31",
    createdAt: "2025.12.28",
    workType: "재택",
    notice: "검수가 완료되었습니다. 성공보수 수수료를 결제하면 계약이 종료됩니다.",
    noticeTone: "purple",
    action: "successFee",
  },
  {
    id: "5",
    title: "커머스 리뉴얼 프로젝트",
    company: "쇼핑랩",
    industry: "커머스",
    filterState: "완료",
    badges: [
      { label: "완료", tone: "green" },
      { label: "성공보수 수수료 결제 완료", tone: "green" },
    ],
    monthlyPay: "월 5,800,000원",
    period: "2025.03.01 ~ 2025.07.31",
    createdAt: "2025.02.24",
    workType: "상주",
    notice: "프로젝트와 모든 수수료 정산이 완료되었습니다.",
    noticeTone: "green",
    action: "review",
  },
  {
    id: "6",
    title: "핀테크 API 연동",
    company: "페이링크",
    industry: "금융",
    filterState: "완료",
    badges: [
      { label: "중도 종료", tone: "red" },
      { label: "위약금 결제 완료", tone: "green" },
    ],
    monthlyPay: "월 6,800,000원",
    period: "2024.10.01 ~ 2024.12.31",
    createdAt: "2024.09.28",
    workType: "재택",
    notice: "계약이 정상 완료 전에 종료되었습니다.",
    noticeTone: "red",
    action: "none",
  },
];

export function FreelancerContracts() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<FreelancerContractStatus>("전체");
  const [paymentContract, setPaymentContract] = useState<FreelancerContractCardProps | null>(null);
  const [successFeeContract, setSuccessFeeContract] = useState<FreelancerContractCardProps | null>(null);
  const visibleContracts = activeStatus === "전체"
    ? CONTRACTS
    : CONTRACTS.filter((contract) => contract.filterState === activeStatus);

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-8">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 sm:px-5">
        <h1 className="text-[20px] font-bold tracking-[-0.6px] text-[#111827]">내 계약</h1>
        <p className="mt-2 text-[11px] font-semibold text-[#748094]">
          계약 체결 이후 진행 상황을 확인하세요.
        </p>

        <FreelancerContractStatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        {visibleContracts.length > 0 ? (
          <div className="mt-5 flex flex-col gap-3">
            {visibleContracts.map((contract) => (
              <FreelancerContractCard
                key={contract.id}
                {...contract}
                onAction={() => {
                  if (contract.action === "upfrontFee") setPaymentContract(contract);
                  if (contract.action === "successFee") setSuccessFeeContract(contract);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-[#dde3ea] bg-white text-[12px] text-[#98a2b3]">
            해당 상태의 계약이 없습니다.
          </div>
        )}
      </div>

      <PaymentMethodModal
        open={paymentContract !== null}
        payment={{
          type: "UPFRONT_FEE",
          title: "착수금 수수료",
          description: paymentContract?.title ?? "프로젝트",
          amount: 210000,
        }}
        onClose={() => setPaymentContract(null)}
        onPay={() => {
          setPaymentContract(null);
          router.push("/freelancer/payments/upfront/complete");
        }}
      />
      <SuccessFeePaymentModal
        open={successFeeContract !== null}
        summary={{
          projectTitle: successFeeContract?.title ?? "프로젝트",
          duration: "3개월",
          contractAmount: 18000000,
          baseRate: 6,
          discountLabel: "마스터 할인 1%",
          discountRate: 5,
          paymentAmount: 900000,
        }}
        onClose={() => setSuccessFeeContract(null)}
        onPay={() => {
          const contractId = successFeeContract?.id ?? "4";
          setSuccessFeeContract(null);
          router.push(`/freelancer/contracts/${contractId}/success-fee/complete`);
        }}
      />
    </main>
  );
}
