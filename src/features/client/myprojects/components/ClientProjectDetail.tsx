"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { ProjectDetailTabs, type ProjectDetailTab } from "@/features/client/myprojects/components/ProjectDetailTabs";
import { ProjectContracts } from "@/features/client/myprojects/contract/components/ProjectContracts";
import { ProjectInformation } from "@/features/client/myprojects/information/components/ProjectInformation";
import { NegotiationActions, ProjectNegotiation } from "@/features/negotiation/components/ProjectNegotiation";
import { ProjectProgress } from "@/features/client/myprojects/progress/components/ProjectProgress";
import { RecommendedCandidates } from "@/features/client/myprojects/recommendation/components/RecommendedCandidates";
import {
  cancelProjectRegistration,
  closeProjectRecruitment,
  completeClientProject,
  extendProjectRecruitment,
  getClientProjectDetail,
} from "@/features/client/myprojects/services/projectDetail";
import type { ClientProjectDetailResponse } from "@/features/client/myprojects/types/projectDetail";
import { ConfirmModal } from "@/features/common/components/Modal";
import { getProjectJobRoles, getProjectSkills, getProjectWorkConditions } from "@/features/client/projects/services/projectPreReview";
import { PaymentMethodModal } from "@/features/payment/components/PaymentMethodModal";
import type { SettlementResponse } from "@/features/payment/types/payment";

type ProjectAction = "cancelRegistration" | "extendRecruitment" | "closeRecruitment" | "complete";

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: "등록 완료",
  RECRUITING: "모집중",
  NEGOTIATING: "협상중",
  CONTRACT_PENDING: "계약 대기",
  IN_PROGRESS: "진행중",
  COMPLETION_PENDING: "완료 대기",
  CLOSED: "종료",
  CANCELED: "취소됨",
};

const PERIOD_UNIT_LABEL: Record<string, string> = { DAY: "일", WEEK: "주", MONTH: "개월", YEAR: "년" };

const ACTION_MODAL: Record<ProjectAction, { title: string; description: string; confirmText: string }> = {
  cancelRegistration: { title: "프로젝트 등록을 취소하시겠습니까?", description: "등록을 취소하면 프로젝트가 취소 상태로 변경됩니다.", confirmText: "등록 취소" },
  extendRecruitment: { title: "프로젝트 모집을 연장하시겠습니까?", description: "현재 모집 마감일이 1주 연장됩니다.", confirmText: "모집 연장" },
  closeRecruitment: { title: "프로젝트 모집을 종료하시겠습니까?", description: "모집을 종료하면 프로젝트가 취소 상태로 변경됩니다.", confirmText: "모집 종료" },
  complete: { title: "프로젝트를 완료하시겠습니까?", description: "완료 처리 후 프로젝트가 완료 대기 상태로 이동합니다.", confirmText: "프로젝트 완료" },
};

const formatDate = (value: string | null) => value ? value.slice(0, 10).replaceAll("-", ".") : "-";

export function ClientProjectDetail() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = Number(params.projectId);
  const initialTab: ProjectDetailTab = searchParams.get("tab") === "candidates" ? "추천 후보" : searchParams.get("tab") === "progress" ? "진행 현황" : "프로젝트 정보";
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>(initialTab);
  const [project, setProject] = useState<ClientProjectDetailResponse | null>(null);
  const [jobRoleLabels, setJobRoleLabels] = useState<Record<string, string>>({});
  const [skillLabels, setSkillLabels] = useState<Record<string, string>>({});
  const [workStyleLabels, setWorkStyleLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ProjectAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const fromTab = searchParams.get("fromTab");
  const projectListHref = fromTab ? `/client/projects?tab=${encodeURIComponent(fromTab)}` : "/client/projects";

  const loadProject = useCallback(async () => {
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setErrorMessage("프로젝트 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [detail, jobRoles, skills, workConditions] = await Promise.all([
        getClientProjectDetail(projectId),
        getProjectJobRoles(),
        getProjectSkills(),
        getProjectWorkConditions(),
      ]);
      setProject(detail);
      setJobRoleLabels(Object.fromEntries(jobRoles.map((item) => [item.code, item.label])));
      setSkillLabels(Object.fromEntries(skills.map((item) => [item.code, item.label])));
      setWorkStyleLabels(Object.fromEntries(workConditions.workStyles.map((item) => [item.code, item.label])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로젝트 상세를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) void loadProject(); });
    return () => { cancelled = true; };
  }, [loadProject]);

  useEffect(() => {
    if (!isActionMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) setIsActionMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsActionMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isActionMenuOpen]);

  const executeAction = async () => {
    if (!project || !pendingAction || isProcessing) return;
    setIsProcessing(true);
    setErrorMessage("");
    try {
      if (pendingAction === "cancelRegistration") await cancelProjectRegistration(project.projectId);
      if (pendingAction === "extendRecruitment") await extendProjectRecruitment(project.projectId);
      if (pendingAction === "closeRecruitment") await closeProjectRecruitment(project.projectId);
      if (pendingAction === "complete") await completeClientProject(project.projectId);
      setPendingAction(null);
      await loadProject();
    } catch (error) {
      setPendingAction(null);
      setErrorMessage(error instanceof Error ? error.message : "프로젝트 상태를 변경하지 못했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const completePayment = (settlement?: SettlementResponse) => {
    setIsPaymentOpen(false);
    if (!project) return;
    if (project.status === "COMPLETION_PENDING") {
      router.push(`/client/projects/${project.projectId}/success-fee/complete`);
    } else {
      router.push(`/client/payments/complete?projectId=${settlement?.projectId ?? project.projectId}`);
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center text-sm text-theme-secondary">프로젝트 상세를 불러오고 있습니다.</div>;
  if (!project) return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><p className="text-sm text-theme-danger">{errorMessage || "프로젝트를 찾을 수 없습니다."}</p><button type="button" onClick={() => void loadProject()} className="rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white">다시 시도</button></main>;

  const showActions = !["CLOSED", "CANCELED"].includes(project.status);
  const canPay = project.payableSettlementId != null && (project.status === "REGISTERED" || project.status === "COMPLETION_PENDING");

  const openAction = (action: ProjectAction) => {
    setIsActionMenuOpen(false);
    setPendingAction(action);
  };

  const actionMenu = showActions ? (
    <div ref={actionMenuRef} className="relative">
      <button type="button" aria-label="프로젝트 관리 메뉴" aria-haspopup="menu" aria-expanded={isActionMenuOpen} onClick={() => setIsActionMenuOpen((open) => !open)} className="flex h-9 w-10 items-center justify-center rounded-[9px] border border-theme bg-surface text-[22px] font-bold text-theme-secondary hover:bg-surface-subtle">···</button>
      <div role="menu" aria-hidden={!isActionMenuOpen} className={`absolute bottom-11 right-0 z-20 w-[170px] origin-bottom-right rounded-[10px] border border-theme bg-surface p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.14)] transition duration-150 ${isActionMenuOpen ? "visible scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"}`}>
        <button type="button" role="menuitem" onClick={() => setIsActionMenuOpen(false)} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-theme-secondary hover:bg-background">프로젝트 수정</button>
        {project.status === "REGISTERED" ? <button type="button" role="menuitem" onClick={() => openAction("cancelRegistration")} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-theme-danger hover:bg-danger-surface">등록 취소</button> : null}
        {project.status === "RECRUITING" ? <><button type="button" role="menuitem" disabled={project.extensionCount >= 2} onClick={() => openAction("extendRecruitment")} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-theme-secondary hover:bg-background disabled:cursor-not-allowed disabled:text-[#b8c2ce]">모집 연장</button><button type="button" role="menuitem" onClick={() => openAction("closeRecruitment")} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-theme-danger hover:bg-danger-surface">모집 종료</button></> : null}
        {project.status === "IN_PROGRESS" ? <button type="button" role="menuitem" onClick={() => openAction("complete")} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-theme-secondary hover:bg-background">프로젝트 완료</button> : null}
        {canPay ? <button type="button" role="menuitem" onClick={() => { setIsActionMenuOpen(false); setIsPaymentOpen(true); }} className="flex h-9 w-full items-center rounded-[7px] px-3 text-[12px] font-semibold text-brand hover:bg-[#eef3f8]">{project.status === "REGISTERED" ? "착수금 결제" : "성공보수 결제"}</button> : null}
      </div>
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-surface-subtle px-5 py-6 text-theme-primary">
      <div className="mx-auto w-full max-w-[1120px]">
        <header>
          <Link href={projectListHref} className="mb-4 flex w-fit items-center gap-2 text-[12px] font-bold text-theme-secondary transition hover:text-theme-primary"><span aria-hidden="true">←</span>프로젝트 목록으로</Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="break-words text-[22px] font-extrabold leading-tight tracking-[-0.04em]">{project.title}</h1>
            <span className="shrink-0 rounded-full border border-theme bg-surface px-3 py-1 text-[11px] font-bold text-theme-secondary">{STATUS_LABEL[project.status] ?? project.status}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold text-theme-muted">
            <span>등록일 {formatDate(project.createdAt)}</span>
            <span>시작 희망일 {formatDate(project.startDesiredDate)}</span>
            <span>기간 {project.periodValue}{PERIOD_UNIT_LABEL[project.periodUnit] ?? project.periodUnit}</span>
            <span>전체 모집 {project.totalHeadcount}명 · 확정 {project.confirmedHeadcount}명</span>
          </div>
        </header>

        {errorMessage ? <p role="alert" className="mt-4 rounded-lg border border-[#fda29b] bg-danger-surface px-4 py-3 text-[12px] font-semibold text-theme-danger">{errorMessage}</p> : null}

        <ProjectDetailTabs activeTab={activeTab} onTabChange={setActiveTab} rightContent={<div className="flex items-center gap-2">{activeTab === "협상" ? <NegotiationActions /> : null}{actionMenu}</div>} />

        {activeTab === "프로젝트 정보" ? <ProjectInformation project={project} jobRoleLabels={jobRoleLabels} skillLabels={skillLabels} workStyleLabel={workStyleLabels[project.workStyle] ?? project.workStyle} /> : activeTab === "추천 후보" ? <RecommendedCandidates /> : activeTab === "협상" ? <ProjectNegotiation /> : activeTab === "계약" ? <ProjectContracts projectId={params.projectId} /> : activeTab === "진행 현황" ? <ProjectProgress projectId={params.projectId} isAllComplete={project.status === "COMPLETION_PENDING" || project.status === "CLOSED"} /> : <div className="mt-6 flex h-[260px] items-center justify-center rounded-[14px] border border-theme bg-surface text-[12px] text-theme-muted">{activeTab} 정보가 없습니다.</div>}
      </div>

      <ConfirmModal open={pendingAction !== null} title={pendingAction ? ACTION_MODAL[pendingAction].title : ""} description={pendingAction ? ACTION_MODAL[pendingAction].description : ""} confirmText={isProcessing ? "처리 중..." : pendingAction ? ACTION_MODAL[pendingAction].confirmText : "확인"} cancelText="취소" onClose={() => !isProcessing && setPendingAction(null)} onConfirm={() => void executeAction()} closeOnOverlayClick={!isProcessing} />
      <PaymentMethodModal open={isPaymentOpen} payment={{ settlementId: project.payableSettlementId ?? undefined, type: project.status === "COMPLETION_PENDING" ? "SUCCESS_FEE" : "UPFRONT_FEE", title: project.status === "COMPLETION_PENDING" ? "성공보수 수수료" : "착수금 수수료", description: project.title, amount: 0 }} onClose={() => setIsPaymentOpen(false)} onPay={completePayment} />
    </main>
  );
}
