import Link from "next/link";

export type FreelancerProjectState = "검토 중" | "협상 중" | "종료됨";

export interface FreelancerProjectCardProps {
  id: string;
  title: string;
  state: FreelancerProjectState;
  result?: string;
  resultNote?: string;
  notice?: string;
  deadline?: string;
  aiMatch?: number;
  industry: string;
  companySize: string;
  position: string;
  budget: string;
  duration: string;
  startDate: string;
  workType: string;
  experience: string;
  skills: string[];
  receivedAt: string;
  round?: string;
  proposedTerms?: {
    monthlyPay: string;
    duration: string;
    workType: string;
    headcount: string;
    note: string;
  };
  onReject?: () => void;
  onAccept?: () => void;
  negotiationHref?: string;
}

export function FreelancerProjectCard(props: FreelancerProjectCardProps) {
  const isEnded = props.state === "종료됨";

  return (
    <article
      className={`rounded-[12px] border px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:px-5 ${
        isEnded
          ? "border-[#e6e9ee] bg-[#fbfbfc] text-[#aab2bf]"
          : "border-theme bg-surface text-theme-primary"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {props.deadline ? (
            <Badge tone="warning">◷&nbsp; {props.deadline}</Badge>
          ) : null}
          {props.state === "협상 중" ? <Badge tone="warning">협상중</Badge> : null}
          {props.notice ? <Badge tone="notice">{props.notice}</Badge> : null}
          {props.result ? (
            <>
              <Badge tone={props.result === "거절함" ? "danger" : "neutral"}>
                {props.result}
              </Badge>
              {props.resultNote ? (
                <span className="text-[11px] font-medium text-[#b2bac5]">
                  {props.resultNote}
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        {props.round ? (
          <span className="text-[11px] font-bold text-brand">
            라운드 {props.round}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <h2 className={`text-[14px] font-bold tracking-[-0.35px] ${isEnded ? "text-[#727d8e]" : "text-theme-primary"}`}>
          {props.title}
        </h2>
        {props.aiMatch != null ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isEnded ? "bg-[#f1f5fb] text-[#7e9dcc]" : "bg-[#edf4ff] text-[#3478f6]"}`}>AI {props.aiMatch}%</span> : null}
      </div>
      <p className="mt-1 text-[11px] font-medium text-theme-muted">
        {props.industry} · {props.companySize}
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-2.5 text-[11px] sm:grid-cols-3">
        <ProjectInfo label="직군" value={props.position} muted={isEnded} />
        <ProjectInfo label="예산" value={props.budget} muted={isEnded} />
        <ProjectInfo label="기간" value={props.duration} muted={isEnded} />
        <ProjectInfo label="시작일" value={props.startDate} muted={isEnded} />
        <ProjectInfo label="근무" value={props.workType} muted={isEnded} />
        <ProjectInfo label="경력" value={props.experience} muted={isEnded} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {props.skills.map((skill) => (
          <span
            key={skill}
            className={`rounded-[5px] border px-2 py-1 text-[10px] font-semibold ${
              isEnded
                ? "border-[#dfe5ed] bg-[#f6f8fa] text-[#8190a4]"
                : "border-[#cadcf5] bg-[#eef5ff] text-brand"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[10px] font-medium text-theme-muted">
          수신일 {props.receivedAt}
        </p>
        <div className="flex gap-2">
          <Link href={`/freelancer/projects/${props.id}`} className={secondaryButtonClass}>
            상세보기
          </Link>
          {!isEnded && props.state === "검토 중" ? (
            <>
              <button type="button" onClick={props.onReject} className={secondaryButtonClass}>거절</button>
              <button type="button" onClick={props.onAccept} className={primaryButtonClass}>수락 및 협상 시작</button>
            </>
          ) : null}
          {!isEnded && props.state === "협상 중" ? (
            <span className="relative">
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#f04438]" />
              {props.negotiationHref ? <Link href={props.negotiationHref} className={`flex items-center ${primaryButtonClass}`}>협상방 입장</Link> : <button type="button" className={primaryButtonClass}>협상방 입장</button>}
            </span>
          ) : null}
        </div>
      </div>

      {props.proposedTerms ? (
        <section className="mt-3.5 rounded-[9px] border border-theme px-3.5 py-3">
          <h3 className="text-[11px] font-bold text-brand">AI 최종 합의 조건</h3>
          <dl className="mt-2.5 grid grid-cols-1 gap-y-2.5 text-[11px] sm:grid-cols-2">
            <ProjectInfo label="월 급여" value={props.proposedTerms.monthlyPay} />
            <ProjectInfo label="기간" value={props.proposedTerms.duration} />
            <ProjectInfo label="근무" value={props.proposedTerms.workType} />
            <ProjectInfo label="모집 인원" value={props.proposedTerms.headcount} />
          </dl>
          <p className="mt-2.5 border-t border-theme pt-2.5 text-[10px] font-semibold text-[#12a150]">
            {props.proposedTerms.note}
          </p>
        </section>
      ) : null}
    </article>
  );
}

const secondaryButtonClass =
  "flex h-[30px] cursor-pointer items-center justify-center rounded-[7px] border border-[#dce2e9] bg-surface px-3.5 text-[11px] font-semibold text-[#526075] transition hover:bg-surface-subtle";
const primaryButtonClass =
  "h-[30px] cursor-pointer rounded-[7px] bg-brand px-3.5 text-[11px] font-bold text-white transition hover:bg-brand";

function Badge({ children, tone }: { children: React.ReactNode; tone: "warning" | "notice" | "danger" | "neutral" }) {
  const colors = {
    warning: "border-[#ffd794] bg-[#fff9eb] text-[#e48100]",
    notice: "border-transparent bg-[#eef5ff] text-[#3478f6]",
    danger: "border-[#ffd8d4] bg-[#fff3f2] text-theme-danger",
    neutral: "border-[#e7e9ed] bg-[#f3f4f6] text-[#a0a8b5]",
  };

  return <span className={`rounded-[7px] border px-2.5 py-1.5 text-[10px] font-semibold ${colors[tone]}`}>{children}</span>;
}

function ProjectInfo({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex min-w-0 gap-1">
      <dt className="shrink-0 text-theme-muted">{label}</dt>
      <dd className={`font-semibold ${muted ? "text-[#7e8998]" : "text-[#263142]"}`}>{value}</dd>
    </div>
  );
}
