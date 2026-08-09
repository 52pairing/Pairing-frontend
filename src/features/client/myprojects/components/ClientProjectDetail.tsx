"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  ProjectDetailTabs,
  type ProjectDetailTab,
} from "@/features/client/myprojects/components/ProjectDetailTabs";
import { ProjectContracts } from "@/features/client/myprojects/contract/components/ProjectContracts";
import { ProjectInformation } from "@/features/client/myprojects/information/components/ProjectInformation";
import { NegotiationActions, ProjectNegotiation } from "@/features/client/myprojects/negotiation/components/ProjectNegotiation";
import { ProjectProgress, ProjectProgressActions } from "@/features/client/myprojects/progress/components/ProjectProgress";
import { ConfirmModal } from "@/features/common/components/Modal";
import { ActionWarningModal } from "@/features/common/components/ActionWarningModal";

export function ClientProjectDetail() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>(
    searchParams.get("tab") === "progress" ? "진행 현황" : "프로젝트 정보",
  );
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isTerminateConfirmOpen, setIsTerminateConfirmOpen] = useState(false);
  const isProjectComplete = searchParams.get("completed") === "true";

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-5 py-5 text-[#172033]">
      <div className="mx-auto w-full max-w-[1120px]">
        <header className="relative">
          <Link
            href="/client/projects"
            className="mb-5 inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#667085] transition hover:text-[#172033]"
          >
            <span aria-hidden="true">←</span>
            내 프로젝트 목록
          </Link>
          <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">
            B2B 주문 관리 서비스 리뉴얼
          </h1>
          <div className="mt-3 flex gap-6 text-[11px] font-semibold text-[#98a2b3]">
            <span>등록일 2026.07.15</span>
            <span>시작 희망일 2026년 9월 1일</span>
            <span>기간 4개월</span>
            <span>전체 모집 3명</span>
          </div>
          {activeTab === "진행 현황" ? (
            <div className="absolute bottom-0 right-0">
              <ProjectProgressActions onComplete={() => setIsCompleteConfirmOpen(true)} onTerminate={() => setIsTerminateConfirmOpen(true)} />
            </div>
          ) : null}
        </header>

        <ProjectDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rightContent={activeTab === "협상" ? <NegotiationActions /> : null}
        />

        {activeTab === "프로젝트 정보" ? (
          <ProjectInformation />
        ) : activeTab === "협상" ? (
          <ProjectNegotiation />
        ) : activeTab === "계약" ? (
          <ProjectContracts projectId={params.projectId} />
        ) : activeTab === "진행 현황" ? (
          <ProjectProgress projectId={params.projectId} isAllComplete={isProjectComplete} />
        ) : (
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-[14px] border border-[#dfe4ea] bg-white text-[12px] font-medium text-[#98a2b3]">
            {activeTab} 정보가 없습니다.
          </div>
        )}
      </div>

      <ConfirmModal
        open={isCompleteConfirmOpen}
        title="프로젝트 완료 처리 및 성공 수수료를 결제하시겠습니까?"
        description="완료 처리 후 성공보수 수수료 결제 페이지로 이동합니다."
        confirmText="확인"
        cancelText="취소"
        onClose={() => setIsCompleteConfirmOpen(false)}
        onConfirm={() =>
          router.push(`/client/projects/${params.projectId}/success-fee`)
        }
      />
      <ActionWarningModal
        open={isTerminateConfirmOpen}
        title="프로젝트를 중도 종료하시겠습니까?"
        description="프로젝트를 중도 종료하면 현재 진행 중인 계약과 작업이 종료 상태로 변경됩니다."
        warningItems={["중도 종료 후에는 진행 상태로 되돌릴 수 없습니다.", "진행된 작업과 지급 내역은 별도로 확인해야 합니다.", "계약 당사자에게 프로젝트 종료 상태가 안내됩니다."]}
        confirmText="중도 종료"
        onClose={() => setIsTerminateConfirmOpen(false)}
        onConfirm={() => setIsTerminateConfirmOpen(false)}
      />
    </main>
  );
}
