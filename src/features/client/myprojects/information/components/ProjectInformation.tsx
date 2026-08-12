"use client";

import { useState } from "react";

import { ProjectFreelancerStatus } from "@/features/client/myprojects/information/components/ProjectFreelancerStatus";
import type { ProjectInformationProps } from "@/features/client/myprojects/types/components";

const PERIOD_UNIT_LABEL: Record<string, string> = {
  DAY: "일",
  WEEK: "주",
  MONTH: "개월",
  YEAR: "년",
};

const formatDate = (value: string | null) =>
  value ? value.slice(0, 10).replaceAll("-", ".") : "-";

const getDeadlineLabel = (deadline: string | null) => {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  deadlineDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000);
  return days >= 0 ? `마감일 D-${days}` : "모집 마감";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function ProjectInformation({
  project,
  jobRoleLabels,
  skillLabels,
  workStyleLabel,
  workFormLabel,
}: ProjectInformationProps) {
  const deadlineLabel = getDeadlineLabel(project.recruitDeadline);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isRemote = project.workStyle === "REMOTE" || workStyleLabel.includes("재택");

  return (
    <>
      <section className="mt-6 rounded-[14px] border border-theme bg-surface px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[14px] font-extrabold">기본 정보</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-theme-secondary">
              {project.extensionCount} / 2회 사용
            </span>
            {deadlineLabel ? (
              <span className="rounded-[8px] border border-theme bg-surface px-4 py-2 text-[11px] font-bold text-theme-danger">
                {deadlineLabel}
              </span>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 grid max-w-[760px] grid-cols-2 gap-x-16 gap-y-5">
          <ProjectDetailInfo label="예산" value={`${project.budgetAmount.toLocaleString("ko-KR")}원`} />
          <ProjectDetailInfo label="기간" value={`${project.periodValue}${PERIOD_UNIT_LABEL[project.periodUnit] ?? project.periodUnit}`} />
          <ProjectDetailInfo label="시작 희망일" value={formatDate(project.startDesiredDate)} />
          <ProjectDetailInfo label="근무 방식" value={workStyleLabel} />
          <ProjectDetailInfo label="근무 형태" value={workFormLabel} />
          {!isRemote && project.workLocation ? <ProjectDetailInfo label="근무 장소" value={project.workLocation} /> : null}
        </dl>
      </section>

      <section className="mt-4 overflow-hidden rounded-[14px] border border-theme bg-surface">
        <button
          type="button"
          aria-expanded={isDetailOpen}
          aria-controls="project-detail-information"
          onClick={() => setIsDetailOpen((open) => !open)}
          className="flex w-full items-center justify-between px-7 py-5 text-left hover:bg-surface-subtle"
        >
          <span className="text-[14px] font-extrabold">상세 정보</span>
          <span aria-hidden="true" className={`text-[16px] text-theme-secondary transition-transform ${isDetailOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>

        {isDetailOpen ? (
          <div id="project-detail-information" className="border-t border-theme px-7 py-6">
            <div className="space-y-7">
              <ProjectDescription label="현재 진행 상황" value={project.currentSituation} />
              <ProjectDescription label="주요 담당 업무" value={project.mainTask} />
              <ProjectDescription label="세부 업무범위" value={project.detailScope} />
              <ProjectDescription label="기타 전달사항 및 우대사항" value={project.extraNote} />
              <div>
                <h3 className="text-[12px] font-bold text-theme-primary">첨부 자료</h3>
                {project.files.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {project.files.map((file) => (
                      <li key={file.fileId} className="flex flex-wrap items-center justify-between gap-3 rounded-[9px] border border-theme px-4 py-3 text-[11px]">
                        <div className="flex min-w-0 items-center gap-2">
                          <span aria-hidden="true">{file.originalName.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/) ? "🖼️" : "📄"}</span>
                          <span className="truncate font-semibold text-theme-secondary">{file.originalName}</span>
                          <span className="shrink-0 text-theme-muted">{formatFileSize(file.sizeBytes)}</span>
                        </div>
                        <a href={file.fileUrl} download={file.originalName} target="_blank" rel="noreferrer" className="shrink-0 font-bold text-brand hover:underline">다운로드</a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-[11px] text-theme-muted">첨부된 자료가 없습니다.</p>}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-[14px] border border-theme bg-surface px-7 py-6">
        <h2 className="text-[14px] font-extrabold">모집 포지션</h2>
        <div className="mt-4 space-y-3">
          {project.positions.map((position) => (
            <article key={position.positionId} className="rounded-[10px] border border-theme px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[13px] font-bold">{jobRoleLabels[position.jobRole] ?? position.jobRole}</h3>
                <span className="text-[11px] font-semibold text-theme-secondary">경력 {position.minCareerYears}년 · {position.headcount}명</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {position.skills.map((skill) => (
                  <span key={skill} className="rounded-[5px] border border-[#cbdcf7] bg-[#eef5ff] px-2.5 py-1 text-[10px] font-semibold text-[#3478f6]">
                    {skillLabels[skill] ?? skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <ProjectFreelancerStatus projectId={project.projectId} jobRoleLabels={jobRoleLabels} />
    </>
  );
}

function ProjectDescription({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <h3 className="border-b border-theme pb-3 text-[12px] font-bold text-theme-primary">{label}</h3>
      <p className="mt-3 whitespace-pre-line text-[12px] leading-6 text-theme-secondary">{value?.trim() || "-"}</p>
    </div>
  );
}

function ProjectDetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-theme-muted">{label}</dt>
      <dd className="mt-1.5 text-[13px] font-bold text-theme-primary">{value}</dd>
    </div>
  );
}
