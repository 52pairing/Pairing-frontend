import Link from "next/link";

export interface CandidateCardProps {
  initial: string;
  name: string;
  role: string;
  status: string;
  requestDate: string;
  responseDate: string;
  remainingTime?: string;
  avatarClass: string;
  /** "협상 시작" 클릭 시 이동할 협상방 경로 */
  negotiationHref: string;
}

export function CandidateCard({
  initial,
  name,
  role,
  status,
  requestDate,
  responseDate,
  remainingTime,
  avatarClass,
  negotiationHref,
}: CandidateCardProps) {
  return (
    <article className="flex min-h-[84px] items-center justify-between rounded-[14px] border border-[#dfe3e8] bg-white px-6 shadow-[0_1px_2px_rgba(16,24,40,0.02)]">
      {/* 왼쪽 프로필 */}
      <div className="flex items-center">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${avatarClass}`}
        >
          {initial}
        </div>

        <div className="ml-4">
          {/* 이름 + 상태 */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] font-bold text-[#111827]">{name}</h2>

            <StatusBadge status={status} />
          </div>

          {/* 상세 정보 */}
          <div className="mt-1.5 flex items-center gap-4 text-[12px] font-semibold text-[#98a2b3]">
            <span>{role}</span>
            <span>요청일 {requestDate}</span>
            <span>응답 기한 {responseDate}</span>

            {remainingTime && (
              <span className="text-[#f79009]">{remainingTime}</span>
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽 액션 */}
      <div className="flex items-center gap-3">
        {status === "수락" && (
          <Link
            href={negotiationHref}
            className="flex h-[36px] items-center rounded-[8px] bg-[#142f50] px-4 text-[12px] font-bold text-white transition hover:bg-[#102641]"
          >
            협상 시작
          </Link>
        )}

        <button
          type="button"
          className="text-[12px] font-bold text-[#3478f6] transition hover:text-[#175cd3]"
        >
          프로필
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    수락: "border-[#abefc6] bg-[#ecfdf3] text-[#039855]",
    "요청 대기": "border-[#b2ccff] bg-[#eff4ff] text-[#2970ff]",
    거절: "border-[#fecdca] bg-[#fef3f2] text-[#f04438]",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styleMap[status] ?? ""
      }`}
    >
      {status}
    </span>
  );
}
