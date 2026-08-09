"use client";

import { useState } from "react";

import {
  FreelancerProjectCard,
  type FreelancerProjectCardProps,
} from "./FreelancerProjectCard";
import {
  FreelancerProjectStatusTabs,
  type FreelancerProjectStatus,
} from "./FreelancerProjectStatusTabs";
import { ProjectRejectModals } from "./ProjectRejectModals";

const PROJECTS: readonly FreelancerProjectCardProps[] = [
  {
    id: "1",
    title: "B2B 주문 관리 서비스 리뉴얼",
    state: "검토 중",
    deadline: "D-1 남음",
    notice: "3일 내 응답 없으면 자동 거절 처리됩니다",
    aiMatch: 94,
    industry: "주식회사 오이랩",
    companySize: "IT/소프트웨어 · 50-100명",
    position: "프론트엔드 개발자",
    budget: "월 6,000,000원",
    duration: "4개월",
    startDate: "2026.09.01",
    workType: "재택 · 풀타임",
    experience: "3년 이상",
    skills: ["React", "Next.js", "TypeScript", "Zustand"],
    receivedAt: "2026.07.20",
  },
  {
    id: "2",
    title: "핀테크 대시보드 개발",
    state: "협상 중",
    notice: "새 AI 제안 1건",
    aiMatch: 88,
    industry: "파이낸스온",
    companySize: "금융 · 10-50명",
    position: "프론트엔드 개발자",
    budget: "월 7,000,000원",
    duration: "3개월",
    startDate: "2026.08.01",
    workType: "재택 · 풀타임",
    experience: "4년 이상",
    skills: ["React", "TypeScript", "D3.js"],
    receivedAt: "2026.07.15",
    round: "4/15",
    proposedTerms: {
      monthlyPay: "6,800,000원",
      duration: "3개월",
      workType: "재택 / 풀타임",
      headcount: "1명",
    },
  },
  {
    id: "3",
    title: "AI 서비스 프론트엔드",
    state: "종료됨",
    result: "응답 기한 마감",
    aiMatch: 72,
    industry: "딥랩",
    companySize: "AI/ML · 10-50명",
    position: "프론트엔드 개발자",
    budget: "월 6,500,000원",
    duration: "6개월",
    startDate: "2026.07.01",
    workType: "상주 · 풀타임",
    experience: "5년 이상",
    skills: ["React", "Next.js"],
    receivedAt: "2026.07.10",
  },
  {
    id: "4",
    title: "이커머스 리뉴얼 프로젝트",
    state: "종료됨",
    result: "거절함",
    aiMatch: 81,
    industry: "쇼핑랩",
    companySize: "커머스 · 50-200명",
    position: "프론트엔드 개발자",
    budget: "월 5,800,000원",
    duration: "5개월",
    startDate: "2026.08.15",
    workType: "재택 · 파트타임",
    experience: "3년 이상",
    skills: ["React", "TypeScript"],
    receivedAt: "2026.07.05",
  },
];

export function FreelancerProjects() {
  const [activeStatus, setActiveStatus] = useState<FreelancerProjectStatus>("전체");
  const [rejectProjectTitle, setRejectProjectTitle] = useState<string | null>(null);
  const visibleProjects = activeStatus === "전체"
    ? PROJECTS
    : PROJECTS.filter((project) => project.state === activeStatus);

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-8">
      <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 sm:px-5">
        <h1 className="text-[20px] font-bold tracking-[-0.6px] text-[#111827]">
          프로젝트 제안
        </h1>
        <FreelancerProjectStatusTabs
          activeStatus={activeStatus}
          onStatusChange={setActiveStatus}
        />

        {visibleProjects.length > 0 ? (
          <div className="mt-5 flex flex-col gap-3">
            {visibleProjects.map((project) => (
              <FreelancerProjectCard
                key={project.id}
                {...project}
                onReject={() => setRejectProjectTitle(project.title)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex h-32 items-center justify-center rounded-xl border border-[#dde3ea] bg-white text-[12px] text-[#98a2b3]">
            해당 상태의 프로젝트가 없습니다.
          </div>
        )}
      </div>
      <ProjectRejectModals
        open={rejectProjectTitle !== null}
        projectTitle={rejectProjectTitle ?? "프로젝트"}
        onClose={() => setRejectProjectTitle(null)}
      />
    </main>
  );
}
