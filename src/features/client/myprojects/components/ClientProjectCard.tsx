import Link from "next/link";

import type { ClientProjectCardProps } from "@/features/client/myprojects/types/components";

export type { ClientProjectCardProps } from "@/features/client/myprojects/types/components";

export function ClientProjectCard({
  projectId,
  title,
  status,
  position,
  skills,
  budget,
  duration,
  startDate,
  headcount,
  registeredAt,
  deadline,
  actionType = "payment",
  detailHref = `/client/projects/${projectId}`,
  onPayment,
  onComplete,
  isCompleting = false,
}: ClientProjectCardProps) {
  return (
    <article className="rounded-[15px] border border-theme bg-surface px-5 py-[18px] shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
      <div className="flex min-h-[130px] justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-[-0.4px] text-theme-primary">
              {title}
            </h2>
            <span
              className={`rounded-[6px] border px-2 py-1 text-[11px] font-semibold ${
                status === "취소됨"
                  ? "border-[#fda29b] bg-[#fff1f0] text-theme-danger"
                  : "border-theme bg-surface-subtle text-[#697586]"
              }`}
            >
              {status}
            </span>
            {deadline ? (
              <span className="rounded-[5px] border border-[#ffd7d7] bg-[#fff4f4] px-2 py-1 text-[11px] font-semibold text-theme-danger">
                {deadline}
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="rounded-[5px] border border-[#dce1e8] bg-[#f3f5f7] px-[9px] py-1 text-[11px] font-semibold text-theme-secondary">
              {position}
            </span>
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-[5px] border border-[#cbdcf7] bg-[#eef5ff] px-[9px] py-1 text-[11px] font-semibold text-[#3478f6]"
              >
                {skill}
              </span>
            ))}
          </div>

          <dl className="mt-2.5 flex items-center gap-4 text-[12px] text-theme-muted">
            <ProjectInfo label="예산" value={budget} />
            <ProjectInfo label="기간" value={duration} />
            <ProjectInfo label="시작일" value={startDate} />
            <ProjectInfo label="인원" value={headcount} />
          </dl>

          <p className="mt-auto text-[11px] font-medium text-theme-muted">
            등록일 {registeredAt}
          </p>
        </div>

        {actionType === "payment" ? (
          <div className="flex items-end gap-2.5">
            <Link
              href={detailHref}
              className="flex h-[34px] cursor-pointer items-center rounded-[8px] border border-[#17375e] bg-surface px-4 text-[12px] font-bold text-brand transition hover:bg-surface-subtle"
            >
              상세보기
            </Link>
            {onPayment ? (
              <button
                type="button"
                onClick={onPayment}
                className="h-[34px] cursor-pointer rounded-[8px] bg-brand px-5 text-[12px] font-bold text-white transition hover:bg-brand"
              >
                결제 하기
              </button>
            ) : null}
          </div>
        ) : actionType === "complete" || actionType === "successFee" ? (
          <div className="flex items-end gap-2.5">
            <DetailButton href={detailHref} />
            <button
              type="button"
              onClick={actionType === "complete" ? onComplete : onPayment}
              disabled={actionType === "complete" ? isCompleting : !onPayment}
              className="h-[34px] cursor-pointer rounded-[8px] bg-brand px-5 text-[12px] font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:bg-[#a7b0bf]"
            >
              {actionType === "complete" && isCompleting
                ? "처리 중..."
                : actionType === "complete"
                  ? "프로젝트 완료"
                  : "성공 수수료 결제"}
            </button>
          </div>
        ) : (
          <div className="flex items-end">
            <DetailButton href={detailHref} />
          </div>
        )}
      </div>
    </article>
  );
}

function DetailButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex h-[34px] min-w-[96px] cursor-pointer items-center justify-center rounded-[8px] border border-[#17375e] bg-surface px-4 text-[12px] font-bold text-brand transition hover:bg-surface-subtle"
    >
      상세 보기
    </Link>
  );
}

function ProjectInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="inline">{label} </dt>
      <dd className="inline font-bold text-[#697586]">{value}</dd>
    </div>
  );
}
