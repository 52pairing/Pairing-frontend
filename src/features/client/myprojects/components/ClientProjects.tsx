"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ClientProjectCard } from "@/features/client/myprojects/components/ClientProjectCard";
import { ProjectStatusTabs } from "@/features/client/myprojects/components/ProjectStatusTabs";
import {
  completeProject,
  getMyProjects,
} from "@/features/client/myprojects/services/clientProjects";
import {
  CLIENT_PROJECT_TABS,
  type ClientProjectListItem,
  type ClientProjectStatus,
  type ClientProjectTab,
  type ProjectPageResponse,
} from "@/features/client/myprojects/types/projectList";
import { ConfirmModal } from "@/features/common/components/Modal";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";
import type { SettlementResponse } from "@/features/payment/types/payment";

const DEFAULT_TAB: ClientProjectTab = "REGISTERED";

const STATUS_LABEL: Record<ClientProjectStatus, string> = {
  REGISTERED: "등록 완료",
  RECRUITING: "모집중",
  NEGOTIATING: "협상중",
  CONTRACT_PENDING: "계약 대기",
  IN_PROGRESS: "진행중",
  COMPLETION_PENDING: "완료 대기",
  CLOSED: "종료",
  CANCELED: "취소됨",
};

const isProjectTab = (value: string | null): value is ClientProjectTab =>
  CLIENT_PROJECT_TABS.some(({ tab }) => tab === value);

const formatDate = (value: string | null | undefined) =>
  value ? value.slice(0, 10).replaceAll("-", ".") : "-";

const getActionType = (tab: ClientProjectTab) => {
  if (tab === "REGISTERED") return "payment" as const;
  if (tab === "IN_PROGRESS") return "complete" as const;
  if (tab === "COMPLETION_PENDING") return "successFee" as const;
  return "detail" as const;
};

export function ClientProjects() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const initialTab = isProjectTab(queryTab) ? queryTab : DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState<ClientProjectTab>(initialTab);
  const [page, setPage] = useState(0);
  const [projectPage, setProjectPage] = useState<ProjectPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentProject, setPaymentProject] = useState<ClientProjectListItem | null>(null);
  const [completionProject, setCompletionProject] = useState<ClientProjectListItem | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getMyProjects({ tab: activeTab, page, size: 10 });
      setProjectPage(response);
    } catch (error) {
      setProjectPage(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "프로젝트 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) void loadProjects();
    });

    return () => {
      cancelled = true;
    };
  }, [loadProjects]);

  const changeTab = (tab: ClientProjectTab) => {
    setActiveTab(tab);
    setPage(0);
    router.replace(`/client/projects?tab=${tab}`, { scroll: false });
  };

  const confirmCompletion = async () => {
    if (!completionProject || isCompleting) return;

    setIsCompleting(true);
    setErrorMessage("");

    try {
      await completeProject(completionProject.projectId);
      setCompletionProject(null);
      changeTab("COMPLETION_PENDING");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "프로젝트 완료 처리에 실패했습니다.",
      );
      setCompletionProject(null);
    } finally {
      setIsCompleting(false);
    }
  };

  const completePayment = (settlement?: SettlementResponse) => {
    const project = paymentProject;
    setPaymentProject(null);

    if (!project) return;

    if (activeTab === "COMPLETION_PENDING") {
      router.push(`/client/projects/${project.projectId}/success-fee/complete`);
      return;
    }

    const projectId = settlement?.projectId ?? project.projectId;
    router.push(`/client/payments/complete?projectId=${projectId}`);
  };

  const projects = projectPage?.content ?? [];

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-5">
        <h1 className="text-[23px] font-bold tracking-[-0.6px] text-[#111827]">
          내 프로젝트
        </h1>

        <ProjectStatusTabs activeTab={activeTab} onTabChange={changeTab} />

        {errorMessage ? (
          <div role="alert" className="mt-6 flex h-[150px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[#fda29b] bg-white text-[12px] font-medium text-[#b42318]">
            <p>{errorMessage}</p>
            <button type="button" onClick={() => void loadProjects()} className="rounded-[8px] border border-[#b42318] px-4 py-2 font-bold">
              다시 시도
            </button>
          </div>
        ) : isLoading ? (
          <div className="mt-6 flex h-[150px] items-center justify-center rounded-[14px] border border-[#dde3ea] bg-white text-[12px] font-medium text-[#667085]">
            프로젝트를 불러오고 있습니다.
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="mt-6 flex flex-col gap-3">
              {projects.map((project) => (
                <ClientProjectCard
                  key={project.projectId}
                  projectId={project.projectId}
                  title={project.title}
                  status={STATUS_LABEL[project.status]}
                  position={project.jobRoleLabels.join(", ")}
                  skills={project.skillLabels}
                  budget={`${project.budgetAmount.toLocaleString("ko-KR")}원`}
                  duration={project.periodLabel}
                  startDate={formatDate(project.startDesiredDate)}
                  headcount={`${project.totalHeadcount}명`}
                  registeredAt={formatDate(project.createdAt)}
                  actionType={getActionType(activeTab)}
                  detailHref={`/client/projects/${project.projectId}?status=${project.status}&payableSettlementId=${project.payableSettlementId ?? ""}&fromTab=${activeTab}`}
                  onPayment={
                    project.payableSettlementId != null
                      ? () => setPaymentProject(project)
                      : undefined
                  }
                  onComplete={() => setCompletionProject(project)}
                  isCompleting={isCompleting && completionProject?.projectId === project.projectId}
                />
              ))}
            </div>

            {projectPage && projectPage.totalPages > 1 ? (
              <nav aria-label="프로젝트 목록 페이지" className="flex items-center justify-center gap-3 py-7">
                <button type="button" disabled={projectPage.first} onClick={() => setPage((current) => Math.max(0, current - 1))} className="rounded-[8px] border border-[#dce2e8] bg-white px-4 py-2 text-[12px] font-semibold text-[#667085] disabled:cursor-not-allowed disabled:opacity-40">
                  이전
                </button>
                <span className="text-[12px] font-semibold text-[#667085]">
                  {projectPage.page + 1} / {projectPage.totalPages}
                </span>
                <button type="button" disabled={projectPage.last} onClick={() => setPage((current) => current + 1)} className="rounded-[8px] border border-[#dce2e8] bg-white px-4 py-2 text-[12px] font-semibold text-[#667085] disabled:cursor-not-allowed disabled:opacity-40">
                  다음
                </button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="mt-6 flex h-[150px] items-center justify-center rounded-[14px] border border-[#dde3ea] bg-white text-[12px] font-medium text-[#98a2b3]">
            해당 상태의 프로젝트가 없습니다.
          </div>
        )}
      </div>

      <PaymentMethodModal
        open={paymentProject !== null}
        payment={{
          settlementId: paymentProject?.payableSettlementId ?? undefined,
          type: activeTab === "COMPLETION_PENDING" ? "SUCCESS_FEE" : "UPFRONT_FEE",
          title: activeTab === "COMPLETION_PENDING" ? "성공보수 수수료" : "착수금 수수료",
          description: paymentProject?.title ?? "프로젝트",
          amount: 0,
        }}
        onClose={() => setPaymentProject(null)}
        onPay={completePayment}
      />

      <ConfirmModal
        open={completionProject !== null}
        title="프로젝트를 완료하시겠습니까?"
        description="완료 처리 후 프로젝트가 완료 대기 상태로 이동합니다."
        confirmText={isCompleting ? "처리 중..." : "프로젝트 완료"}
        cancelText="취소"
        onClose={() => !isCompleting && setCompletionProject(null)}
        onConfirm={() => void confirmCompletion()}
        closeOnOverlayClick={!isCompleting}
      />
    </main>
  );
}
