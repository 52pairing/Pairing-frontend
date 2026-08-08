"use client";

import { useState } from "react";

import {
  ProjectDetailTabs,
  type ProjectDetailTab,
} from "@/features/client/myprojects/components/ProjectDetailTabs";
import { ProjectInformation } from "@/features/client/myprojects/information/components/ProjectInformation";
import { ProjectNegotiation } from "@/features/client/myprojects/negotiation/components/ProjectNegotiation";

export function ClientProjectDetail() {
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("프로젝트 정보");

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-5 py-5 text-[#172033]">
      <div className="mx-auto w-full max-w-[1120px]">
        <header>
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

        <ProjectDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "프로젝트 정보" ? (
          <ProjectInformation />
        ) : activeTab === "협상" ? (
          <ProjectNegotiation />
        ) : (
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-[14px] border border-[#dfe4ea] bg-white text-[12px] font-medium text-[#98a2b3]">
            {activeTab} 정보가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
