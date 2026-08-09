"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ClientProjectCard } from "@/features/client/myprojects/components/ClientProjectCard";
import {
  ProjectStatusTabs,
  type ProjectStatus,
} from "@/features/client/myprojects/components/ProjectStatusTabs";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";

const REGISTERED_PROJECTS = [{
  title: "쇼핑몰 관리자 페이지 리뉴얼",
  status: "등록 완료",
  position: "프론트엔드 개발자",
  skills: ["React", "TypeScript", "Tailwind"],
  budget: "15,000,000원",
  duration: "3개월",
  startDate: "2026.08.15",
  headcount: "1명",
  registeredAt: "2026.07.31",
  actionType: "payment" as const,
}];

const MATCHING_PROJECTS = [
  {
    title: "핀테크 대시보드 개발",
    status: "모집 중",
    deadline: "마감일 D-5",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "detail" as const,
  },
  {
    title: "사이트 대시보드 개발",
    status: "협상 중",
    position: "풀스택 개발자",
    skills: ["React", "Next.js", "TypeScript"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "detail" as const,
  },
  {
    title: "쇼핑몰 대시보드 개발",
    status: "계약 대기",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "detail" as const,
  },
];

const IN_PROGRESS_PROJECTS = [
  {
    title: "핀테크 대시보드 개발",
    status: "진행 중",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "complete" as const,
  },
];

const COMPLETION_PENDING_PROJECTS = [
  {
    title: "핀테크 대시보드 개발",
    status: "완료 대기",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "successFee" as const,
  },
];

const ENDED_PROJECTS = [
  {
    title: "핀테크 대시보드 개발",
    status: "종료",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "detail" as const,
  },
];

const CANCELLED_PROJECTS = [
  {
    title: "핀테크 대시보드 개발",
    status: "취소",
    position: "풀스택 개발자",
    skills: ["React", "Node.js", "PostgreSQL"],
    budget: "15,000,000원",
    duration: "3개월",
    startDate: "2026.08.15",
    headcount: "2명",
    registeredAt: "2026.07.31",
    actionType: "detail" as const,
  },
];

const PROJECTS_BY_STATUS = {
  "등록 완료": REGISTERED_PROJECTS,
  "매칭 중": MATCHING_PROJECTS,
  "진행 중": IN_PROGRESS_PROJECTS,
  "완료 대기": COMPLETION_PENDING_PROJECTS,
  종료: ENDED_PROJECTS,
  취소: CANCELLED_PROJECTS,
} satisfies Record<ProjectStatus, readonly ClientProject[]>;

type ClientProject = Parameters<typeof ClientProjectCard>[0];

export function ClientProjects() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<ProjectStatus>("등록 완료");
  const [paymentProject, setPaymentProject] = useState<ClientProject | null>(null);
  const projects = PROJECTS_BY_STATUS[activeStatus];

  const completePayment = () => {
    setPaymentProject(null);
    router.push("/client/payments/complete");
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pt-5">
        <h1 className="text-[23px] font-bold tracking-[-0.6px] text-[#111827]">
          내 프로젝트
        </h1>

        <ProjectStatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        {projects.length > 0 ? (
          <div className="mt-6 flex flex-col gap-3">
            {projects.map((project) => (
              <ClientProjectCard
                key={project.title}
                {...project}
                onPayment={
                  project.actionType === "payment"
                    ? () => setPaymentProject(project)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex h-[150px] items-center justify-center rounded-[14px] border border-[#dde3ea] bg-white text-[12px] font-medium text-[#98a2b3]">
            해당 상태의 프로젝트가 없습니다.
          </div>
        )}
      </div>

      <PaymentMethodModal
        open={paymentProject !== null}
        payment={{
          type: "UPFRONT_FEE",
          title: "착수금 수수료",
          description: paymentProject?.title ?? "프로젝트",
          amount: 450000,
        }}
        onClose={() => setPaymentProject(null)}
        onPay={completePayment}
      />
    </main>
  );
}
