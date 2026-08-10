import { ProjectFreelancerStatus } from "@/features/client/myprojects/information/components/ProjectFreelancerStatus";
import type { ClientProjectDetailResponse } from "@/features/client/myprojects/types/projectDetail";

interface ProjectInformationProps {
  project: ClientProjectDetailResponse;
  jobRoleLabels: Record<string, string>;
  skillLabels: Record<string, string>;
  workStyleLabel: string;
}

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
}: ProjectInformationProps) {
  const deadlineLabel = getDeadlineLabel(project.recruitDeadline);

  return (
    <>
      <section className="mt-6 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[14px] font-extrabold">기본 정보</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#667085]">
              {project.extensionCount} / 2회 사용
            </span>
            {deadlineLabel ? (
              <span className="rounded-[8px] border border-[#e4e7ec] bg-white px-4 py-2 text-[11px] font-bold text-[#f04438]">
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
          {project.workLocation ? <ProjectDetailInfo label="근무 장소" value={project.workLocation} /> : null}
        </dl>
      </section>

      <section className="mt-4 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
        <h2 className="text-[14px] font-extrabold">모집 포지션</h2>
        <div className="mt-4 space-y-3">
          {project.positions.map((position) => (
            <article key={position.positionId} className="rounded-[10px] border border-[#e2e7ec] px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[13px] font-bold">{jobRoleLabels[position.jobRole] ?? position.jobRole}</h3>
                <span className="text-[11px] font-semibold text-[#667085]">경력 {position.minCareerYears}년 · {position.headcount}명</span>
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

      {project.files.length > 0 ? (
        <section className="mt-4 rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
          <h2 className="text-[14px] font-extrabold">첨부 파일</h2>
          <div className="mt-4 space-y-2">
            {project.files.map((file) => (
              <a key={file.fileId} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[9px] border border-[#e2e7ec] px-4 py-3 text-[12px] hover:bg-[#f8fafc]">
                <span className="font-semibold text-[#475467]">{file.originalName}</span>
                <span className="text-[#98a2b3]">{formatFileSize(file.sizeBytes)}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <ProjectFreelancerStatus projectId={project.projectId} jobRoleLabels={jobRoleLabels} />
    </>
  );
}

function ProjectDetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold text-[#98a2b3]">{label}</dt>
      <dd className="mt-1.5 text-[13px] font-bold text-[#172033]">{value}</dd>
    </div>
  );
}
