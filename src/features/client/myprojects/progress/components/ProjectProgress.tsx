import Link from "next/link";

type ProjectProgressProps = {
  projectId: string;
  isAllComplete: boolean;
};

const MEMBERS = [
  { id: 1, initial: "김", name: "김개발", role: "프론트엔드", pay: "월 6,200,000원", avatarClass: "bg-[#3777f6]" },
  { id: 2, initial: "이", name: "이서연", role: "프론트엔드", pay: "월 5,800,000원", avatarClass: "bg-[#7839ee]" },
  { id: 3, initial: "박", name: "박서버", role: "백엔드", pay: "월 5,500,000원", avatarClass: "bg-[#16a34a]" },
] as const;

export function ProjectProgress({ projectId, isAllComplete }: ProjectProgressProps) {
  return (
    <section className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        {MEMBERS.map((member, index) => {
          const isComplete = isAllComplete || index < 2;

          return (
            <article key={member.id} className="flex min-h-[104px] items-center justify-between rounded-[14px] border border-[#dfe4ea] bg-white px-6 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-[16px] font-bold text-white ${member.avatarClass}`}>{member.initial}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-bold text-[#111827]">{member.name}</h2>
                    <span className="rounded-full border border-[#c9d3df] bg-[#f7f9fb] px-2.5 py-1 text-[10px] font-bold text-[#526174]">{isComplete ? "완료" : "진행중"}</span>
                  </div>
                  <p className="mt-2 text-[12px] font-semibold text-[#667085]">{member.role} · {member.pay}</p>
                </div>
              </div>

              <Link href={`/client/projects/${projectId}/contracts/${member.id}`} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#d8dee7] px-4 text-[12px] font-semibold text-[#667085] transition hover:bg-[#f8fafc]">
                <span aria-hidden="true">▧</span> 계약서
              </Link>
            </article>
          );
        })}
      </div>

      <aside className="rounded-[14px] border border-[#dfe4ea] bg-white px-7 py-6">
        <h2 className="text-[14px] font-bold text-[#111827]">프로젝트 정보</h2>
        <dl className="mt-5 space-y-5 text-[12px]">
          <InfoRow label="시작일" value="2026.09.01" />
          <InfoRow label="종료 예정일" value="2026.12.31" />
          <InfoRow label="예산" value="60,000,000원" />
          <InfoRow label="계약 인원" value="3명" />
          <InfoRow label="근무 방식" value="재택" />
        </dl>
      </aside>
    </section>
  );
}

export function ProjectProgressActions({ onComplete, onTerminate }: { onComplete: () => void; onTerminate: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onTerminate} className="h-9 cursor-pointer rounded-[8px] border border-[#f04438] bg-white px-4 text-[12px] font-bold text-[#f04438] transition hover:bg-[#fff5f4]">중도 종료</button>
      <button type="button" onClick={onComplete} className="h-9 cursor-pointer rounded-[8px] bg-[#102846] px-5 text-[12px] font-bold text-white transition hover:bg-[#0c2039]">프로젝트 완료 처리</button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="font-semibold text-[#98a2b3]">{label}</dt><dd className="font-bold text-[#172033]">{value}</dd></div>;
}
