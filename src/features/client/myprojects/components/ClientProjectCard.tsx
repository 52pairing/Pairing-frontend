import Link from "next/link";

export interface ClientProjectCardProps {
  projectId: number;
  title: string;
  status: string;
  position: string;
  skills: string[];
  budget: string;
  duration: string;
  startDate: string;
  headcount: string;
  registeredAt: string;
  deadline?: string;
  actionType?: "payment" | "detail" | "complete" | "successFee";
  detailHref?: string;
  onPayment?: () => void;
  onComplete?: () => void;
  isCompleting?: boolean;
}

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
    <article className="rounded-[15px] border border-[#dde3ea] bg-white px-5 py-[18px] shadow-[0_2px_4px_rgba(15,23,42,0.03)]">
      <div className="flex min-h-[130px] justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-[-0.4px] text-[#111827]">
              {title}
            </h2>
            <span
              className={`rounded-[6px] border px-2 py-1 text-[11px] font-semibold ${
                status === "취소됨"
                  ? "border-[#fda29b] bg-[#fff1f0] text-[#f04438]"
                  : "border-[#dfe4ea] bg-[#f7f8fa] text-[#697586]"
              }`}
            >
              {status}
            </span>
            {deadline ? (
              <span className="rounded-[5px] border border-[#ffd7d7] bg-[#fff4f4] px-2 py-1 text-[11px] font-semibold text-[#f04438]">
                {deadline}
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="rounded-[5px] border border-[#dce1e8] bg-[#f3f5f7] px-[9px] py-1 text-[11px] font-semibold text-[#475467]">
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

          <dl className="mt-2.5 flex items-center gap-4 text-[12px] text-[#8b95a5]">
            <ProjectInfo label="예산" value={budget} />
            <ProjectInfo label="기간" value={duration} />
            <ProjectInfo label="시작일" value={startDate} />
            <ProjectInfo label="인원" value={headcount} />
          </dl>

          <p className="mt-auto text-[11px] font-medium text-[#9aa4b2]">
            등록일 {registeredAt}
          </p>
        </div>

        {actionType === "payment" ? (
          <div className="flex items-end gap-2.5">
            <Link
              href={detailHref}
              className="flex h-[34px] cursor-pointer items-center rounded-[8px] border border-[#17375e] bg-white px-4 text-[12px] font-bold text-[#183858] transition hover:bg-[#f8fafc]"
            >
              상세보기
            </Link>
            {onPayment ? (
              <button
                type="button"
                onClick={onPayment}
                className="h-[34px] cursor-pointer rounded-[8px] bg-[#132d4f] px-5 text-[12px] font-bold text-white transition hover:bg-[#0f2541]"
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
              className="h-[34px] cursor-pointer rounded-[8px] bg-[#132d4f] px-5 text-[12px] font-bold text-white transition hover:bg-[#0f2541] disabled:cursor-not-allowed disabled:bg-[#a7b0bf]"
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
      className="flex h-[34px] min-w-[96px] cursor-pointer items-center justify-center rounded-[8px] border border-[#17375e] bg-white px-4 text-[12px] font-bold text-[#183858] transition hover:bg-[#f8fafc]"
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
