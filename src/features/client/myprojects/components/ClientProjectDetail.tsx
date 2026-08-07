"use client";

import { useState } from "react";

import { ProjectDetailTabs, type ProjectDetailTab } from "@/features/client/myprojects/components/ProjectDetailTabs";
import { ProjectFreelancerStatus } from "@/features/client/myprojects/components/ProjectFreelancerStatus";

export function ClientProjectDetail() {
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("프로젝트 정보");

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-5 py-5 text-[#172033]">
      <div className="mx-auto w-full max-w-[1120px]">
        <header>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-[-0.04em]">B2B 주문 관리 서비스 리뉴얼</h1>
            <div className="mt-3 flex gap-6 text-[11px] font-semibold text-[#98a2b3]">
              <span>등록일 2026.07.15</span><span>시작 희망일 2026년 9월 1일</span><span>기간 4개월</span><span>전체 모집 3명</span>
            </div>
          </div>
        </header>

        <ProjectDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "프로젝트 정보" ? (
          <>
            <section className="mt-6 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[14px] font-extrabold">기본 정보</h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-[8px] border border-[#e4e7ec] bg-white px-4 py-2 text-[11px] font-bold text-[#f04438]">마감일 D-5</span>
                  <span className="text-[11px] font-bold text-[#667085]">0 / 2회 사용</span>
                  <button type="button" className="h-[34px] cursor-pointer rounded-[8px] border border-[#dce2e8] bg-white px-4 text-[11px] font-bold text-[#667085] hover:bg-[#f8fafc]">✎ 수정</button>
                  <button type="button" className="h-[34px] cursor-pointer rounded-[8px] border border-[#f04438] bg-white px-4 text-[11px] font-bold text-[#f04438] hover:bg-[#fff5f4]">모집 종료</button>
                </div>
              </div>
              <dl className="mt-5 grid max-w-[680px] grid-cols-2 gap-x-16 gap-y-5">
                <ProjectDetailInfo label="예산" value="60,000,000원" />
                <ProjectDetailInfo label="기간" value="4개월" />
                <ProjectDetailInfo label="시작 희망일" value="2026년 9월 1일" />
                <ProjectDetailInfo label="근무 방식" value="재택" />
              </dl>
            </section>
            <ProjectFreelancerStatus />
          </>
        ) : (
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-[14px] border border-[#dfe4ea] bg-white text-[12px] font-medium text-[#98a2b3]">{activeTab} 정보가 없습니다.</div>
        )}
      </div>
    </main>
  );
}

function ProjectDetailInfo({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-semibold text-[#98a2b3]">{label}</dt><dd className="mt-1.5 text-[13px] font-bold text-[#172033]">{value}</dd></div>;
}
