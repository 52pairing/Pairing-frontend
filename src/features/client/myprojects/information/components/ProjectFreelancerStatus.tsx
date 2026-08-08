"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const FREELANCERS = [
  { name: "김개발", role: "프론트엔드", initial: "김", color: "bg-[#3975ef]", status: "협상 중" },
  { name: "이서연", role: "프론트엔드", initial: "이", color: "bg-[#7c3aed]", status: "요청 대기" },
  { name: "박서버", role: "백엔드", initial: "박", color: "bg-[#16a34a]", status: "계약 완료" },
];

export function ProjectFreelancerStatus() {
  const params = useParams();
  const projectId = String(params.projectId ?? "");

  return (
    <section className="mt-4 rounded-[14px] border border-[#dfe4ea] bg-white px-6 py-5">
      <h2 className="text-[14px] font-extrabold text-[#172033]">프리랜서 현황</h2>
      <div className="mt-4 space-y-2.5">
        {FREELANCERS.map((freelancer) => (
          <article key={freelancer.name} className="flex min-h-[62px] items-center justify-between rounded-[10px] border border-[#e2e7ec] px-3">
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white ${freelancer.color}`}>{freelancer.initial}</span>
              <div>
                <h3 className="text-[12px] font-bold text-[#172033]">{freelancer.name}</h3>
                <p className="mt-0.5 text-[10px] text-[#98a2b3]">{freelancer.role}</p>
              </div>
            </div>
            <FreelancerAction
              status={freelancer.status}
              negotiationHref={`/client/projects/${projectId}/negotiation`}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function FreelancerAction({
  status,
  negotiationHref,
}: {
  status: string;
  negotiationHref: string;
}) {
  if (status === "협상 중") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[#f5d9a6] bg-[#fff8e9] px-3 py-1 text-[10px] font-bold text-[#d97706]">협상 중</span>
        <Link
          href={negotiationHref}
          className="flex h-[34px] cursor-pointer items-center rounded-[8px] bg-[#17365d] px-4 text-[11px] font-bold text-white hover:bg-[#102a49]"
        >
          협상 하기
        </Link>
      </div>
    );
  }

  const isComplete = status === "계약 완료";
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${isComplete ? "border-[#b7ebcd] bg-[#ecfdf3] text-[#16a34a]" : "border-[#c9dcfa] bg-[#eef5ff] text-[#3478f6]"}`}>{status}</span>;
}
