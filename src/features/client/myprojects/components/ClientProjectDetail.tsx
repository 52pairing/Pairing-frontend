"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ProjectDetailTabs,
  type ProjectDetailTab,
} from "@/features/client/myprojects/components/ProjectDetailTabs";
import { ProjectContracts } from "@/features/client/myprojects/contract/components/ProjectContracts";
import { ProjectInformation } from "@/features/client/myprojects/information/components/ProjectInformation";
import { NegotiationActions, ProjectNegotiation } from "@/features/client/myprojects/negotiation/components/ProjectNegotiation";

export function ClientProjectDetail() {
  const params = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("프로젝트 정보");

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-5 py-5 text-[#172033]">
      <div className="mx-auto w-full max-w-[1120px]">
        <header>
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
        ) : (
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-[14px] border border-[#dfe4ea] bg-white text-[12px] font-medium text-[#98a2b3]">
            {activeTab} 정보가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
