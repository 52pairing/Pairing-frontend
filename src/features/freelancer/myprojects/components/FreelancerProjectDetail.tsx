"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { ProjectRejectModals } from "./ProjectRejectModals";

const PROJECT_DETAILS = {
  "1": {
    title: "B2B 주문 관리 서비스 리뉴얼",
    company: "주식회사 오이랩 · IT/소프트웨어 기업",
    role: "프론트엔드 개발자",
    budget: "월 6,000,000원",
    duration: "4개월",
    startDate: "2026.09.01",
    workType: "재택 / 풀타임",
    experience: "3년 이상",
    summary: "B2B 주문 관리 서비스의 사용자 화면과 관리자 기능을 리뉴얼합니다.",
    responsibilities: "React 기반 화면 개발, 주문 관리 기능 및 공통 컴포넌트 구현",
    skills: ["React", "Next.js", "TypeScript", "Zustand"],
  },
  "2": {
    title: "핀테크 대시보드 개발",
    company: "파이낸스온 · 금융 IT 기업",
    role: "프론트엔드 개발자",
    budget: "월 7,000,000원",
    duration: "3개월",
    startDate: "2026.08.01",
    workType: "재택 / 풀타임",
    experience: "4년 이상",
    summary: "금융 데이터를 한눈에 확인할 수 있는 핀테크 대시보드를 개발합니다.",
    responsibilities: "대시보드 UI 개발, 데이터 시각화 및 API 연동",
    skills: ["React", "TypeScript", "D3.js"],
  },
  "3": {
    title: "AI 서비스 프론트엔드",
    company: "딥랩 · AI/ML 기업",
    role: "프론트엔드 개발자",
    budget: "월 6,500,000원",
    duration: "6개월",
    startDate: "2026.07.01",
    workType: "상주 / 풀타임",
    experience: "5년 이상",
    summary: "AI 기반 업무 지원 서비스의 프론트엔드를 구축합니다.",
    responsibilities: "서비스 화면 개발, AI 응답 UI 및 상태 관리",
    skills: ["React", "Next.js"],
  },
  "4": {
    title: "이커머스 리뉴얼 프로젝트",
    company: "쇼핑랩 · 커머스 기업",
    role: "프론트엔드 개발자",
    budget: "월 5,800,000원",
    duration: "5개월",
    startDate: "2026.08.15",
    workType: "재택 / 파트타임",
    experience: "3년 이상",
    summary: "기존 이커머스 서비스의 구매 경험과 주요 화면을 개선합니다.",
    responsibilities: "상품·주문 화면 리뉴얼 및 반응형 UI 개발",
    skills: ["React", "TypeScript"],
  },
} as const;

export function FreelancerProjectDetail() {
  const params = useParams<{ projectId: string }>();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const project = PROJECT_DETAILS[params.projectId as keyof typeof PROJECT_DETAILS] ?? PROJECT_DETAILS["1"];

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 text-[#172033] sm:px-5">
      <div className="mx-auto w-full max-w-[1000px]">
        <Link
          href="/freelancer/projects"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3478f6] hover:text-[#1f62d1]"
        >
          <span aria-hidden="true">←</span> 제안 목록
        </Link>

        <section className="mt-5 rounded-xl border border-[#dde3ea] bg-white px-6 py-7">
          <h1 className="text-[16px] font-bold tracking-[-0.4px]">{project.title}</h1>
          <p className="mt-3 text-[11px] font-semibold text-[#64748b]">{project.company}</p>
        </section>

        <section className="mt-4 rounded-xl border border-[#dde3ea] bg-white px-6 py-6">
          <h2 className="text-[14px] font-bold">프로젝트 정보</h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-20 gap-y-4 text-[11px] sm:grid-cols-2">
            <DetailInfo label="역할" value={project.role} />
            <DetailInfo label="예산" value={project.budget} />
            <DetailInfo label="기간" value={project.duration} />
            <DetailInfo label="시작일" value={project.startDate} />
            <DetailInfo label="근무 형태" value={project.workType} />
            <DetailInfo label="경력 요건" value={project.experience} />
          </dl>
        </section>

        <section className="mt-4 rounded-xl border border-[#dde3ea] bg-white px-6 py-6">
          <h2 className="text-[14px] font-bold">상세 정보</h2>
          <dl className="mt-5 space-y-4 text-[11px]">
            <DetailInfo label="프로젝트 상황" value={project.summary} />
            <DetailInfo label="담당 업무" value={project.responsibilities} />
            <div>
              <dt className="text-[#98a2b3]">요구 기술</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-[#eef3f8] px-3 py-1.5 font-semibold text-[#183858]">
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setIsRejectOpen(true)}
            className="h-9 rounded-lg border border-[#f04438] bg-white px-5 text-[11px] font-bold text-[#f04438] hover:bg-[#fff5f4]"
          >
            거절
          </button>
          <button type="button" className="h-9 rounded-lg bg-[#132d4f] px-5 text-[11px] font-bold text-white hover:bg-[#0f2541]">
            수락 및 협상 시작
          </button>
        </div>
      </div>

      <ProjectRejectModals
        open={isRejectOpen}
        projectTitle={project.title}
        onClose={() => setIsRejectOpen(false)}
      />
    </main>
  );
}

function DetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <dt className="text-[#98a2b3]">{label}</dt>
      <dd className="font-semibold text-[#172033]">{value}</dd>
    </div>
  );
}
